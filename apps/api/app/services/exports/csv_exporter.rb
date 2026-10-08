require "csv"

module Exports
  class CsvExporter
    def initialize(account)
      @account = account
    end

    def contacts
      generate_csv(@account.contacts.kept) do |contact|
        {
          "First Name" => contact.first_name,
          "Last Name" => contact.last_name,
          "Email" => escape_formula(contact.email),
          "Phone" => contact.phone,
          "Company" => contact.company&.name,
          "Status" => contact.status,
          "Billing Address" => contact.full_address(:billing),
          "Shipping Address" => contact.full_address(:shipping),
          "Lead Score" => contact.lead_score,
          "Created At" => contact.created_at
        }
      end
    end

    def companies
      generate_csv(@account.companies.kept) do |company|
        {
          "Name" => company.name,
          "Domain" => escape_formula(company.domain),
          "Industry" => company.industry,
          "Size Range" => company.size_range,
          "Annual Revenue" => company.annual_revenue,
          "Billing Address" => company.full_address(:billing),
          "Shipping Address" => company.full_address(:shipping),
          "Description" => company.description
        }
      end
    end

    def deals
      generate_csv(@account.deals.kept.includes(:stage, :contact, :company)) do |deal|
        {
          "Title" => deal.title,
          "Amount" => deal.amount,
          "Currency" => deal.currency,
          "Stage" => deal.stage.name,
          "Contact" => deal.contact&.full_name,
          "Company" => deal.company&.name,
          "Expected Close Date" => deal.expected_close_date,
          "Status" => deal.closed_at ? "Closed" : "Open"
        }
      end
    end

    private

    def generate_csv(scope)
      CSV.generate(headers: true) do |csv|
        first = true
        scope.find_each do |record|
          row = yield(record)
          if first
            csv << row.keys
            first = false
          end
          csv << row.values
        end
      end
    end

    def escape_formula(value)
      return nil if value.blank?
      return value unless value.to_s.match?(/\A[=+\-@]/)

      "'#{value}"
    end
  end
end
