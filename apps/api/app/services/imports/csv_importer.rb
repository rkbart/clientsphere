module Imports
  # Synchronous contacts CSV import (fits small-business files; runs inline
  # so the result — including row errors — returns in the response).
  # - mapping: { "CSV Header" => "first_name" | "last_name" | "email" | "phone" }
  #   (headers also auto-match common aliases, case-insensitive)
  # - dedupe: "skip" (default) or "update" existing contacts matched by email
  class CsvImporter
    require "csv"
    FIELDS = %w[first_name last_name email phone].freeze
    HEADER_ALIASES = {
      "firstname" => "first_name", "first name" => "first_name", "given name" => "first_name",
      "lastname" => "last_name", "last name" => "last_name", "surname" => "last_name",
      "family name" => "last_name",
      "email" => "email", "e-mail" => "email", "email address" => "email",
      "phone" => "phone", "phone number" => "phone", "tel" => "phone",
      "telephone" => "phone", "mobile" => "phone",
    }.freeze
    MAX_ERRORS = 50

    attr_reader :imported, :updated, :skipped, :errors

    def initialize(account, file, mapping: {}, dedupe: "skip")
      @account = account
      @file = file
      @mapping = mapping.to_h
      @dedupe = dedupe == "update" ? "update" : "skip"
      @imported = 0
      @updated = 0
      @skipped = 0
      @errors = []
    end

    def run!
      CSV.foreach(@file.path, headers: true).with_index(2) do |row, lineno|
        import_row(row, lineno)
      end
      self
    end

    def summary
      {
        imported: @imported, updated: @updated, skipped: @skipped,
        total: @imported + @updated + @skipped + @errors.size,
        errors: @errors, errors_truncated: @errors.size >= MAX_ERRORS,
      }
    end

    def self.default_mapping(headers)
      headers.filter_map do |header|
        field = HEADER_ALIASES[header.to_s.strip.downcase] ||
                (FIELDS.include?(header.to_s.strip) ? header.to_s.strip : nil)
        [header, field] if field
      end.to_h
    end

    private

    def import_row(row, lineno)
      attrs = map_row(row)
      email = attrs["email"].to_s.strip
      existing = email.present? ? @account.contacts.where("LOWER(email) = ?", email.downcase).first : nil

      if existing
        if @dedupe == "update"
          existing.update!(attrs.compact_blank)
          @updated += 1
        else
          @skipped += 1
        end
      else
        @account.contacts.create!(attrs)
        @imported += 1
      end
    rescue ActiveRecord::RecordInvalid => e
      record_error(lineno, row, e.record.errors.full_messages)
    end

    def map_row(row)
      data = row.to_h
      mapping = @mapping.presence || self.class.default_mapping(data.keys)
      mapping.filter_map do |header, field|
        next unless FIELDS.include?(field.to_s)

        value = data[header].to_s.strip
        [field, value.presence]
      end.to_h
    end

    def record_error(lineno, row, messages)
      @errors << { row: lineno, data: row.to_h.slice(*row.headers.first(4)), errors: messages } if @errors.size < MAX_ERRORS
    end
  end
end
