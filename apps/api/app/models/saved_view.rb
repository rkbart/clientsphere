class SavedView < ApplicationRecord
  belongs_to :account
  belongs_to :user

  validates :name, presence: true
  validates :entity_type, presence: true
end
