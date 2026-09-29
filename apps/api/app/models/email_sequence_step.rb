class EmailSequenceStep < ApplicationRecord
  belongs_to :sequence, class_name: "EmailSequence"

  validates :step_order, presence: true
  validates :delay_days, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :subject, presence: true
  validates :body, presence: true

  default_scope { order(:step_order) }
end
