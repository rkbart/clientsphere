class EmailSequence < ApplicationRecord
  belongs_to :account
  has_many :steps, class_name: "EmailSequenceStep", foreign_key: :sequence_id, dependent: :destroy
  has_many :enrollments, class_name: "SequenceEnrollment", foreign_key: :sequence_id, dependent: :destroy

  validates :name, presence: true
end
