module CustomFields
  # Validates a record's custom_data hash against the account's
  # CustomFieldDefinitions for that entity type.
  class Validator
    EMAIL_PATTERN = /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/
    NUMERIC_PATTERN = /\A-?\d+(\.\d+)?\z/

    def initialize(account, entity_type)
      @definitions = account.custom_field_definitions.where(entity_type: entity_type).index_by(&:key)
    end

    def validate(record)
      data = stringify_keys(record.custom_data)

      data.each_key do |key|
        record.errors.add(:custom_data, "unknown field: #{key}") unless @definitions.key?(key)
      end

      @definitions.each do |key, definition|
        value = data[key]
        if blank_value?(value)
          record.errors.add(:custom_data, "#{definition.label} is required") if definition.required?
          next
        end
        check_type(record, definition, value)
      end
    end

    private

    def stringify_keys(data)
      return {} unless data.is_a?(Hash)

      data.to_h { |k, v| [k.to_s, v] }
    end

    def blank_value?(value)
      value.nil? || (value.respond_to?(:empty?) && value.empty?)
    end

    def check_type(record, definition, value)
      case definition.field_type
      when "text", "text_area", "phone"
        record.errors.add(:custom_data, "#{definition.label} must be text") unless value.is_a?(String)
      when "number", "currency", "percentage"
        unless value.is_a?(Numeric) || value.to_s.match?(NUMERIC_PATTERN)
          record.errors.add(:custom_data, "#{definition.label} must be a number")
        end
      when "boolean"
        unless [true, false].include?(value)
          record.errors.add(:custom_data, "#{definition.label} must be true or false")
        end
      when "date"
        unless parseable_date?(value)
          record.errors.add(:custom_data, "#{definition.label} must be a date (YYYY-MM-DD)")
        end
      when "datetime"
        unless parseable_datetime?(value)
          record.errors.add(:custom_data, "#{definition.label} must be a datetime")
        end
      when "email"
        unless value.is_a?(String) && value.match?(EMAIL_PATTERN)
          record.errors.add(:custom_data, "#{definition.label} must be an email address")
        end
      when "url"
        record.errors.add(:custom_data, "#{definition.label} must be a URL") unless valid_url?(value)
      when "select"
        unless choices(definition).include?(value)
          record.errors.add(:custom_data, "#{definition.label} must be one of: #{choices(definition).join(', ')}")
        end
      when "multi_select"
        unless value.is_a?(Array) && value.all? { |v| choices(definition).include?(v) }
          record.errors.add(:custom_data, "#{definition.label} must be a list of: #{choices(definition).join(', ')}")
        end
      end
    end

    def choices(definition)
      Array(definition.options["choices"])
    end

    def parseable_date?(value)
      return true if value.is_a?(Date)

      Date.iso8601(value.to_s)
      true
    rescue ArgumentError
      false
    end

    def parseable_datetime?(value)
      return true if value.is_a?(Time) || value.is_a?(DateTime)

      DateTime.iso8601(value.to_s)
      true
    rescue ArgumentError
      false
    end

    def valid_url?(value)
      return false unless value.is_a?(String)

      uri = URI.parse(value)
      %w[http https].include?(uri.scheme) && uri.host.present?
    rescue URI::InvalidURIError
      false
    end
  end
end
