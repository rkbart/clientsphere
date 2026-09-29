class EmailSequence < ApplicationRecord
  belongs_to :account
  has_many :steps, class_name: "EmailSequenceStep", dependent: :destroy
  has_many :enrollments, class_name: "SequenceEnrollment", dependent: :destroy

  validates :name, presence: true
end
