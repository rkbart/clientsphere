class CustomObjectDefinition < ApplicationRecord
  belongs_to :account
  has_many :records, class_name: "CustomObjectRecord", foreign_key: :custom_object_definition_id, dependent: :destroy

  validates :name, presence: true, uniqueness: { scope: :account_id }
  validates :icon, presence: true
end
