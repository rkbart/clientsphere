class Api::V1::ResendWebhooksController < Api::V1::BaseController
  skip_before_action :set_current_account_and_user
  skip_after_action :verify_authorized

  # Public: Resend calls this per account-specific URL. Authenticity comes
  # from the Svix signature, verified against that account's stored secret.
  TIMESTAMP_TOLERANCE = 300

  STATUS_BY_EVENT = {
    "email.delivered" => :delivered,
    "email.opened" => :opened,
    "email.bounced" => :failed
  }.freeze

  def create
    account = Account.find(params[:account_id])
    secret = account.email_setting&.webhook_secret
    return render json: { error: "Webhook not configured." }, status: :not_found if secret.blank?

    raw_body = request.body.read
    return render json: { error: "Invalid signature." }, status: :unauthorized unless valid_signature?(secret, raw_body)

    handle(JSON.parse(raw_body), account)
    render json: { ok: true }
  rescue JSON::ParserError
    render json: { error: "Bad payload." }, status: :bad_request
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Unknown account." }, status: :not_found
  end

  private

  def valid_signature?(secret, raw_body)
    id = request.headers["webhook-id"]
    timestamp = request.headers["webhook-timestamp"]
    signatures = request.headers["webhook-signature"]&.split(" ")
    return false if id.blank? || timestamp.blank? || signatures.blank?
    return false if (Time.current.to_i - timestamp.to_i).abs > TIMESTAMP_TOLERANCE

    key = begin
      Base64.strict_decode64(secret.sub(/\Awhsec_/, ""))
    rescue ArgumentError
      nil
    end
    return false if key.nil?

    signed = "#{id}.#{timestamp}.#{raw_body}"
    expected = Base64.strict_encode64(OpenSSL::HMAC.digest("SHA256", key, signed))
    signatures.any? { |sig| ActiveSupport::SecurityUtils.secure_compare(sig.delete_prefix("v1,"), expected) }
  end

  def handle(event, account)
    status = STATUS_BY_EVENT[event["type"]]
    message_id = event.dig("data", "email_id")
    return if status.nil? || message_id.blank?

    email = account.emails.find_by(provider_message_id: message_id)
    return if email.nil?
    return if Email.statuses[email.status] >= Email.statuses[status.to_s]

    attrs = { status: status }
    attrs[:opened_at] = Time.current if status == :opened && email.opened_at.nil?
    email.update!(attrs)
  end
end
