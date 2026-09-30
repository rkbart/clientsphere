# Chains exact-match jsonb filters for known custom fields only.
# Usage: scope = CustomFields::Filter.apply(scope, Current.account, "Contact", params[:custom])
module CustomFields::Filter
  def self.apply(scope, account, entity_type, filters)
    return scope if filters.blank?

    known_keys = account.custom_field_definitions.where(entity_type: entity_type).pluck(:key).to_set
    filters.to_unsafe_h.each do |key, value|
      next unless known_keys.include?(key.to_s) && value.present?

      scope = scope.where("custom_data ->> ? = ?", key.to_s, value.to_s)
    end
    scope
  end
end
