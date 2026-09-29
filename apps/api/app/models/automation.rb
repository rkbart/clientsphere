class Automation < ApplicationRecord
  include PaperTrail::Model

  belongs_to :account
  has_many :automation_runs, dependent: :destroy

  enum :trigger_type, {
    contact_created: 0,
    contact_updated: 1,
    deal_created: 2,
    deal_stage_changed: 3,
    deal_won: 4,
    deal_lost: 5,
    activity_completed: 6,
    activity_overdue: 7
  }

  validates :name, presence: true
  validates :trigger_type, presence: true
end
