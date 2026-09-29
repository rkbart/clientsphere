class Webhook < ApplicationRecord
  belongs_to :account
  has_many :deliveries, class_name: "WebhookDelivery", dependent: :destroy

  validates :url, presence: true
  validates :events, presence: true

  encrypts :secret

  def sign(payload)
    OpenSSL::HMAC.hexdigest("SHA256", secret, payload)
  end
end
