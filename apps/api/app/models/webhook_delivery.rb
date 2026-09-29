class WebhookDelivery < ApplicationRecord
  belongs_to :account
  belongs_to :webhook

  enum :status, { pending: 0, success: 1, failed: 2, retrying: 3 }
end
