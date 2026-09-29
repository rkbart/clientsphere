class Tag < ApplicationRecord
  belongs_to :account
  has_many :taggings, dependent: :destroy
  has_many :contacts, through: :taggings, source: :taggable, source_type: "Contact"
  has_many :companies, through: :taggings, source: :taggable, source_type: "Company"
  has_many :deals, through: :taggings, source: :taggable, source_type: "Deal"

  validates :name, presence: true
  validates :name, uniqueness: { scope: :account_id }
end
