class Email < ApplicationRecord
  include PaperTrail::Model

  belongs_to :account
  belongs_to :contact, optional: true
  belongs_to :deal, optional: true

  enum :direction, { inbound: 0, outbound: 1 }
  enum :status, { draft: 0, sent: 1, delivered: 2, opened: 3, failed: 4 }

  validates :subject, presence: true
end
