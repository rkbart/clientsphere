class EmailSetting < ApplicationRecord
  belongs_to :account

  PROVIDERS = %w[resend gmail].freeze

  encrypts :resend_api_key
  encrypts :webhook_secret
  encrypts :smtp_password
  encrypts :gmail_refresh_token

  validates :provider, inclusion: { in: PROVIDERS }

  def configured?
    resend_api_key.present?
  end

  # Either provider can deliver: a Resend key, or Gmail — via the
  # workspace's connected Google grant (API, works anywhere incl. Render)
  # or Gmail SMTP (app password, needs open submission ports).
  def delivery_configured?
    return true if resend_api_key.present?
    return false unless provider == "gmail"

    gmail_api_ready? || (from_address.present? && smtp_password.present?)
  end

  def gmail?
    provider == "gmail"
  end

  # Workspace-level Gmail API grant: connected once by an owner/admin, used
  # for every workspace send regardless of who triggers it.
  def gmail_api_ready?
    gmail_refresh_token.present? && !gmail_grant_revoked?
  end
end
