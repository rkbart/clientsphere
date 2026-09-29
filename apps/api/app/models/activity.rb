class Activity < ApplicationRecord
  include PaperTrail::Model

  belongs_to :account
  belongs_to :contact, optional: true
  belongs_to :company, optional: true
  belongs_to :deal, optional: true
  belongs_to :creator, class_name: "User"
  belongs_to :assignee, class_name: "User", optional: true

  enum :kind, { call: 0, meeting: 1, task: 2, email: 3, other: 4 }

  validates :subject, presence: true

  scope :incomplete, -> { where(completed_at: nil) }
  scope :complete, -> { where.not(completed_at: nil) }
  scope :due_soon, -> { where("due_at < ?", 3.days.from_now).incomplete }
end
