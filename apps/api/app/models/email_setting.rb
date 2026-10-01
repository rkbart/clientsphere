class EmailSetting < ApplicationRecord
  belongs_to :account

  encrypts :resend_api_key
  encrypts :webhook_secret

  def configured?
    resend_api_key.present?
  end
end
