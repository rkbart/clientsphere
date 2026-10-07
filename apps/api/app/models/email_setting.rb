class EmailSetting < ApplicationRecord
  belongs_to :account
  belongs_to :gmail_user, class_name: "User", optional: true

  PROVIDERS = %w[resend gmail].freeze

  encrypts :resend_api_key
  encrypts :webhook_secret
  encrypts :smtp_password

  validates :provider, inclusion: { in: PROVIDERS }
  validate :gmail_sender_is_connected, if: :gmail?

  def configured?
    resend_api_key.present?
  end

  # Either provider can deliver: a Resend key, or Gmail API through the
  # connected Google account's refresh token (see GmailApi).
  def delivery_configured?
    return true if resend_api_key.present?
    return false unless gmail?

    gmail_user&.google_refresh_token.present?
  end

  def gmail?
    provider == "gmail"
  end

  private

  # The Gmail API sends as the token owner, so the From address must be
  # that address — anything else fails at send time with an opaque error.
  def gmail_sender_is_connected
    if gmail_user.nil? || gmail_user.google_refresh_token.blank?
      errors.add(:gmail_user, "must log in with Google first so ClientSphere can send as them")
    elsif from_address.present? && gmail_user.google_email.present? &&
          !from_address.casecmp?(gmail_user.google_email)
      errors.add(:from_address, "must match the connected Gmail address")
    end
  end
end
