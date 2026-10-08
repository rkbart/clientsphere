# Structured billing/shipping addresses stored as jsonb
# ({ street, city, state, postal_code, country }). Included by Contact and
# Company so both a person-customer and an org-customer can be invoiced and
# shipped to without a separate address table.
module Addressable
  extend ActiveSupport::Concern

  ADDRESS_KEYS = %w[street city state postal_code country].freeze

  included do
    before_validation :normalize_addresses
    validate :addresses_valid
  end

  # Single-line display, e.g. "123 Main St, Berlin 10115, Germany".
  # Falls back to the legacy free-text column when the structured
  # billing address is empty (pre-split records).
  def full_address(kind = :billing)
    address = send("#{kind}_address") || {}
    parts = [
      address["street"].presence,
      [address["city"].presence, address["state"].presence, address["postal_code"].presence].compact.join(" "),
      address["country"].presence,
    ].reject(&:blank?)
    parts.join(", ").presence || legacy_address_fallback
  end

  private

  def normalize_addresses
    self.billing_address = normalize_address(billing_address)
    self.shipping_address = normalize_address(shipping_address)
  end

  def normalize_address(value)
    return {} if value.blank?
    return value unless value.is_a?(Hash)

    value.to_h.slice(*ADDRESS_KEYS).transform_keys(&:to_s).compact_blank
  end

  def addresses_valid
    { billing_address: billing_address, shipping_address: shipping_address }.each do |attr, value|
      next if value.blank?
      unless value.is_a?(Hash)
        errors.add(attr, "must be an object")
        next
      end
      unknown = value.keys.map(&:to_s) - ADDRESS_KEYS
      errors.add(attr, "has unknown keys: #{unknown.join(', ')}") if unknown.any?
    end
  end

  # Models including Addressable predate structured addresses:
  # contacts had `city`, companies had `address`.
  def legacy_address_fallback
    respond_to?(:address) ? address.presence : city.presence
  end
end
