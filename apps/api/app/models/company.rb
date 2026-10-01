class Company < ApplicationRecord
  include Discard::Model
  include PaperTrail::Model

  belongs_to :account
  belongs_to :owner, class_name: "User", optional: true
  belongs_to :added_by, class_name: "User", optional: true
  belongs_to :main_contact, class_name: "Contact", optional: true
  has_many :contacts, dependent: :destroy
  has_many :deals, dependent: :destroy
  has_many :notes, as: :notable, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :taggings, as: :taggable, dependent: :destroy
  has_many :tags, through: :taggings

  validates :name, presence: true
  validates :employee_count, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validate :custom_data_matches_definitions
  validate :social_links_valid
  validate :main_contact_in_account

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
      unless Contact::SOCIAL_PLATFORMS.include?(platform)
        errors.add(:social_links, "has unknown platform #{platform.inspect}")
      end
      errors.add(:social_links, "needs a URL") if url.blank?
      errors.add(:social_links, "needs a valid URL") if url.present? && url !~ %r{\Ahttps?://}i
    end
  end

  def main_contact_in_account
    return if main_contact.nil?

    if main_contact.account_id != account_id
      errors.add(:main_contact, "must belong to the same account")
    end
  end

  def custom_data_matches_definitions
    return if account.nil?

    CustomFields::Validator.new(account, "Company").validate(self)
  end
end
