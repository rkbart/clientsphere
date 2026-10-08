class Api::V1::EmailSettingsController < Api::V1::BaseController
  def show
    setting = Current.account.email_setting
    authorize setting || EmailSetting.new(account: Current.account)
    render json: settings_payload(setting)
  end

  def update
    setting = Current.account.email_setting || Current.account.build_email_setting
    authorize setting
    attributes = email_settings_params
    attributes = attributes.except(:resend_api_key) if attributes[:resend_api_key].blank?
    attributes = attributes.except(:webhook_secret) if attributes[:webhook_secret].blank?
    attributes = attributes.except(:smtp_password) if attributes[:smtp_password].blank?
    setting.assign_attributes(attributes)
    setting.save!
    render json: settings_payload(setting)
  end

  # Mints the signed handoff token the connect flow hangs the workspace
  # grant on. Owner/admin only; the token binds account + user and expires
  # in 10 minutes.
  def gmail_connect_token
    setting = Current.account.email_setting || Current.account.build_email_setting
    authorize setting, :update?
    unless ENV["GOOGLE_CLIENT_ID"].present? && ENV["GOOGLE_CLIENT_SECRET"].present?
      return render json: { error: "Google OAuth is not configured on this server." },
                    status: :unprocessable_entity
    end
    token = Rails.application.message_verifier("gmail_connect").generate(
      { account_id: Current.account.id, user_id: Current.user.id },
      expires_at: 10.minutes.from_now,
      purpose: "gmail_connect"
    )
    render json: { connect_token: token }
  end

  # Removes the workspace Gmail grant (API sending falls back to SMTP or
  # stops resolving until reconnected). Owner/admin only.
  def gmail_disconnect
    setting = Current.account.email_setting
    authorize setting || EmailSetting.new(account: Current.account), :update?
    setting&.update!(gmail_refresh_token: nil, gmail_address: nil, gmail_grant_revoked: false)
    render json: settings_payload(Current.account.reload.email_setting)
  end

  private

  def settings_payload(setting)
    # delivery_configured: anything at all can deliver (includes the global
    # env fallback). workspace_configured: THIS workspace has its own
    # provider credentials — the onboarding nudge keys off this, since env
    # credentials are invisible and unmanageable from the UI.
    configured = EmailDelivery.for_account(Current.account).present?
    workspace_ready = setting&.delivery_configured? || false
    return { from_address: nil, provider: "resend", inbound_address: nil, gmail_connected: false, gmail_address: nil, gmail_needs_reconnect: false, delivery_configured: configured, workspace_configured: workspace_ready, resend_api_key_set: false, smtp_password_set: false, webhook_secret_set: false, webhook_url: nil } unless setting

    {
      from_address: setting.from_address,
      inbound_address: setting.inbound_address,
      gmail_connected: setting.gmail_refresh_token.present?,
      gmail_address: setting.gmail_address,
      gmail_needs_reconnect: setting.gmail_grant_revoked?,
      provider: setting.provider,
      delivery_configured: configured,
      workspace_configured: workspace_ready,
      resend_api_key_set: setting.resend_api_key.present?,
      smtp_password_set: setting.smtp_password.present?,
      webhook_secret_set: setting.webhook_secret.present?,
      webhook_url: webhook_url(setting)
    }
  end

  def webhook_url(setting)
    return nil unless setting.webhook_secret.present?

    host = ENV.fetch("APP_HOST", "http://localhost:3000").chomp("/")
    "#{host}/api/v1/webhooks/resend/#{setting.account_id}"
  end

  def email_settings_params
    params.require(:email_setting).permit(:from_address, :inbound_address, :provider, :resend_api_key, :smtp_password, :webhook_secret)
  end
end
