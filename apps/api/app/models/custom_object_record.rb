class CustomObjectRecord < ApplicationRecord
  belongs_to :account
  belongs_to :custom_object_definition

  validates :data, presence: true
end
