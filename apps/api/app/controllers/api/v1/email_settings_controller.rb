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
    setting.assign_attributes(attributes)
    # Gmail sends as whoever saves the setting — their Google login must
    # have granted the gmail.send scope (a login without consent stores no
    # token, and the model rejects the save with a plain message).
    setting.gmail_user = (setting.provider == "gmail" ? Current.user : nil)
    setting.save!
    render json: settings_payload(setting)
  end

  private

  def settings_payload(setting)
    # delivery_configured: anything at all can deliver (includes the global
    # env fallback). workspace_configured: THIS workspace has its own
    # provider credentials — the onboarding nudge keys off this, since env
    # credentials are invisible and unmanageable from the UI.
    configured = EmailDelivery.for_account(Current.account).present?
    workspace_ready = setting&.delivery_configured? || false
    return { from_address: nil, provider: "resend", delivery_configured: configured, workspace_configured: workspace_ready, gmail_connected_as: nil, resend_api_key_set: false, webhook_secret_set: false, webhook_url: nil } unless setting

    {
      from_address: setting.from_address,
      provider: setting.provider,
      delivery_configured: configured,
      workspace_configured: workspace_ready,
      gmail_connected_as: setting.gmail_user&.google_email,
      resend_api_key_set: setting.resend_api_key.present?,
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
    params.require(:email_setting).permit(:from_address, :provider, :resend_api_key, :webhook_secret)
  end
end
