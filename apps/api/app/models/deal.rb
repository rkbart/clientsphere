class Deal < ApplicationRecord
  include Discard::Model
  include PaperTrail::Model

  belongs_to :account
  belongs_to :pipeline
  belongs_to :stage
  belongs_to :contact, optional: true
  belongs_to :company, optional: true
  belongs_to :owner, class_name: "User", optional: true
  has_many :activities, dependent: :destroy
  has_many :notes, as: :notable, dependent: :destroy
  has_many :taggings, as: :taggable, dependent: :destroy
  has_many :tags, through: :taggings

  validates :title, presence: true
  validates :amount, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  scope :by_stage, ->(stage_id) { where(stage_id: stage_id) }
  scope :open, -> { where(closed_at: nil) }
  scope :won, -> { where.not(closed_at: nil).where(stage: { kind: :won }) }
  scope :lost, -> { where.not(closed_at: nil).where(stage: { kind: :lost }) }

  def move_to!(stage_id, position: nil)
    update!(stage_id: stage_id, position: position || 0)
  end
end
