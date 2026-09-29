class SequenceEnrollment < ApplicationRecord
  belongs_to :sequence, class_name: "EmailSequence"
  belongs_to :contact

  enum :status, { active: 0, paused: 1, completed: 2, unsubscribed: 3 }

  validates :current_step, presence: true, numericality: { greater_than_or_equal_to: 1 }
end
