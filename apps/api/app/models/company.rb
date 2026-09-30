class Company < ApplicationRecord
  include Discard::Model
  include PaperTrail::Model

  belongs_to :account
  belongs_to :owner, class_name: "User", optional: true
  has_many :contacts, dependent: :destroy
  has_many :deals, dependent: :destroy
  has_many :notes, as: :notable, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :taggings, as: :taggable, dependent: :destroy
  has_many :tags, through: :taggings

  validates :name, presence: true
  validate :custom_data_matches_definitions

  private

  def custom_data_matches_definitions
    return if account.nil?

    CustomFields::Validator.new(account, "Company").validate(self)
  end
end
