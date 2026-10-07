class EmailSetting < ApplicationRecord
  belongs_to :account

  PROVIDERS = %w[resend gmail].freeze

  encrypts :resend_api_key
  encrypts :webhook_secret
  encrypts :smtp_password

  validates :provider, inclusion: { in: PROVIDERS }

  def configured?
    resend_api_key.present?
  end

  # Either provider can deliver: a Resend key, or Gmail SMTP (workspace Gmail
  # address as the sender plus an app password).
  def delivery_configured?
    return true if resend_api_key.present?
    return false unless provider == "gmail"

    from_address.present? && smtp_password.present?
  end

  def gmail?
    provider == "gmail"
  end
end
