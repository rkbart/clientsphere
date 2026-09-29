class CustomFieldDefinition < ApplicationRecord
  belongs_to :account

  enum :field_type, {
    text: 0,
    number: 1,
    boolean: 2,
    date: 3,
    datetime: 4,
    select: 5,
    multi_select: 6,
    email: 7,
    phone: 8,
    url: 9,
    currency: 10,
    percentage: 11,
    text_area: 12
  }, scopes: false

  validates :key, presence: true, uniqueness: { scope: [:account_id, :entity_type] }
  validates :label, presence: true
  validates :entity_type, presence: true
end
