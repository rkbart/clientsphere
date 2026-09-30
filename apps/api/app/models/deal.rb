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
  validate :custom_data_matches_definitions

  after_create_commit { Automations::Trigger.call(account, :deal_created, self) }
  after_update_commit :trigger_deal_update_events

  scope :by_stage, ->(stage_id) { where(stage_id: stage_id) }
  scope :open, -> { where(closed_at: nil) }
  scope :won, -> { where.not(closed_at: nil).where(stage: { kind: :won }) }
  scope :lost, -> { where.not(closed_at: nil).where(stage: { kind: :lost }) }

  def move_to!(target_stage_id, position: nil)
    transaction do
      update!(stage_id: target_stage_id, position: 0)
      siblings = Deal.where(stage_id: target_stage_id).where.not(id: id).order(:position, :created_at).to_a
      index = position.to_i.clamp(0, siblings.length)
      siblings.insert(index, self)
      siblings.each_with_index { |deal, i| deal.update_column(:position, i) }
    end
  end

  private

  def custom_data_matches_definitions
    return if account.nil?

    CustomFields::Validator.new(account, "Deal").validate(self)
  end

  def trigger_deal_update_events
    return unless previous_changes.key?("stage_id")

    Automations::Trigger.call(account, :deal_stage_changed, self)
    new_stage = Stage.find_by(id: stage_id)
    Automations::Trigger.call(account, :deal_won, self) if new_stage&.won?
    Automations::Trigger.call(account, :deal_lost, self) if new_stage&.lost?
  end
end
