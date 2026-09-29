module Imports
  class CsvImporter
    attr_reader :id, :status, :errors

    def initialize(account, file)
      @account = account
      @file = file
      @id = SecureRandom.uuid
      @status = :pending
      @errors = []
    end

    def run!
      @status = :processing

      CSV.foreach(@file.path, headers: true) do |row|
        contact = @account.contacts.create!(
          first_name: row["first_name"],
          last_name: row["last_name"],
          email: row["email"],
          phone: row["phone"]
        )
      rescue ActiveRecord::RecordInvalid => e
        @errors << { row: row.to_h, errors: e.record.errors.full_messages }
      end

      @status = @errors.empty? ? :completed : :completed_with_errors
    rescue => e
      @status = :failed
      @errors << { error: e.message }
    end

    def self.find(id)
      OpenStruct.new(id: id, status: :completed, errors: [])
    end
  end
end
