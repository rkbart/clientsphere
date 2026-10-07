require "mail"

# Resolves which provider delivers a given send and performs it.
#
# The provider is chosen per workspace via EmailSetting#provider ("resend"
# by default, "gmail" to send through the Gmail HTTPS API as the linked
# Google account — SMTP submission ports are filtered on some hosts, so
# Gmail goes over port 443 instead). Account-less sends (password resets)
# use global env credentials instead. Returns the provider's message id.
class EmailDelivery
  DEFAULT_TIMEOUT = 10

  Resolved = Struct.new(:provider, :from, :resend_key, :gmail_user, keyword_init: true)

  # Per-workspace resolution. Falls back to the global Resend key so
  # workspaces without their own setting keep today's behavior.
  def self.for_account(account)
    setting = account&.email_setting
    from = setting&.from_address.presence || ENV.fetch("EMAIL_FROM_ADDRESS", "noreply@example.com")
    if setting&.gmail? && setting.gmail_user&.google_refresh_token.present?
      Resolved.new(provider: "gmail", from: setting.from_address.presence || setting.gmail_user.google_email,
                   gmail_user: setting.gmail_user)
    elsif (key = setting&.resend_api_key.presence || ENV.fetch("RESEND_API_KEY", nil)).present?
      Resolved.new(provider: "resend", from: from, resend_key: key)
    end
  end

  # Global resolution for sends without an account context.
  def self.global
    from = ENV.fetch("EMAIL_FROM_ADDRESS", "noreply@example.com")
    if ENV.fetch("RESEND_API_KEY", nil).present?
      Resolved.new(provider: "resend", from: from, resend_key: ENV.fetch("RESEND_API_KEY"))
    end
  end

  def self.deliver(resolved, to:, subject:, html:, text: nil, cc: [], bcc: [], timeout: DEFAULT_TIMEOUT)
    raise ArgumentError, "no delivery provider resolved" if resolved.nil?

    Timeout.timeout(timeout) do
      if resolved.provider == "gmail"
        deliver_gmail_api(resolved, to: to, cc: cc, bcc: bcc, subject: subject, html: html, text: text)
      else
        deliver_resend(resolved, to: to, cc: cc, bcc: bcc, subject: subject, html: html, text: text)
      end
    end
  end

  def self.deliver_resend(resolved, to:, subject:, html:, text: nil, cc: [], bcc: [])
    Resend.api_key = resolved.resend_key || ""
    params = { from: resolved.from, to: Array(to), subject: subject, html: html }
    params[:text] = text if text.present?
    params[:cc] = Array(cc) if Array(cc).present?
    params[:bcc] = Array(bcc) if Array(bcc).present?
    response = Resend::Emails.send(params)
    response[:id]
  end

  def self.deliver_gmail_api(resolved, to:, subject:, html:, text: nil, cc: [], bcc: [])
    user = resolved.gmail_user
    raise ArgumentError, "gmail sender has no linked Google account" if user.nil?
    raise GmailApi::AuthError, "Google grant expired — reconnect Gmail" if user.google_refresh_token.blank?

    mail = build_message(from: resolved.from, to: to, cc: cc, bcc: bcc,
                         subject: subject, html: html, text: text)
    access_token = GmailApi.access_token(user.google_refresh_token)
    GmailApi.send_email(access_token: access_token, mail: mail)
  end

  def self.build_message(from:, to:, subject:, html:, text: nil, cc: [], bcc: [])
    mail = Mail.new do
      from from
      to Array(to)
      cc Array(cc) if Array(cc).present?
      bcc Array(bcc) if Array(bcc).present?
      subject subject
      text_part { body text } if text.present?
      html_part do
        content_type "text/html; charset=UTF-8"
        body html
      end
    end
    domain = from.to_s.split("@").last.presence || "clientsphere"
    mail.message_id = "<#{SecureRandom.uuid}@#{domain}>"
    mail
  end

  private_class_method :deliver_resend, :deliver_gmail_api
end
