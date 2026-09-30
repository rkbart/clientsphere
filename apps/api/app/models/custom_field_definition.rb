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
  validates :key, format: { with: /\A[a-z][a-z0-9_]*\z/, message: "must be snake_case starting with a letter" }
  validates :label, presence: true
  validates :entity_type, presence: true, inclusion: { in: %w[Contact Company Deal] }
  validate :options_match_field_type

  private

  def options_match_field_type
    return unless select? || multi_select?

    list = options.is_a?(Hash) ? options["choices"] : nil
    return if list.is_a?(Array) && list.any? && list.all?(String)

    errors.add(:options, "must include a non-empty choices list for select fields")
  end
end
