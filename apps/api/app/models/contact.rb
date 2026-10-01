class Contact < ApplicationRecord
  include Discard::Model
  include PaperTrail::Model

  enum :status, { lead: 0, customer: 1, churned: 2 }, default: :lead

  belongs_to :account
  belongs_to :company, optional: true
  belongs_to :owner, class_name: "User", optional: true
  has_many :deals, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :notes, as: :notable, dependent: :destroy
  has_many :emails, dependent: :destroy
  has_many :sequence_enrollments, dependent: :destroy
  has_many :taggings, as: :taggable, dependent: :destroy
  has_many :tags, through: :taggings

  SOCIAL_PLATFORMS = %w[linkedin x facebook instagram youtube github website other].freeze

  validates :first_name, presence: true
  validates :email, uniqueness: { scope: :account_id, conditions: -> { kept } }, allow_blank: true
  validate :custom_data_matches_definitions
  validate :social_links_valid

  after_create_commit { Automations::Trigger.call(account, :contact_created, self) }
  # Discarding is a delete, not an update — don't fire update automations for it.
  after_update_commit { Automations::Trigger.call(account, :contact_updated, self) unless discarded_at? }

  scope :search, ->(query) { where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?", "%#{query}%", "%#{query}%", "%#{query}%") }

  def full_name
    [first_name, last_name].compact.join(" ")
  end

  def score!
    Leads::Scorer.new(self).call
  end

  private

  def social_links_valid
    return if social_links.blank?

    unless social_links.is_a?(Array)
      errors.add(:social_links, "must be a list")
      return
    end

    social_links.each do |link|
      platform = link["platform"].to_s
      url = link["url"].to_s.strip
      unless SOCIAL_PLATFORMS.include?(platform)
        errors.add(:social_links, "has unknown platform #{platform.inspect}")
      end
      errors.add(:social_links, "needs a URL") if url.blank?
      errors.add(:social_links, "needs a valid URL") if url.present? && url !~ %r{\Ahttps?://}i
    end
  end

  def custom_data_matches_definitions
    return if account.nil?

    CustomFields::Validator.new(account, "Contact").validate(self)
  end
end
