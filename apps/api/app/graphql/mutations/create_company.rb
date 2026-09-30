module Mutations
  class CreateCompany < BaseMutation
    argument :name, String, required: true
    argument :domain, String, required: false
    argument :industry, String, required: false
    argument :size_range, String, required: false
    argument :annual_revenue, Float, required: false
    argument :description, String, required: false
    argument :owner_id, ID, required: false
    argument :custom_data, GraphQL::Types::JSON, required: false

    field :company, Types::CompanyType, null: true
    field :errors, [String], null: false

    def resolve(name:, domain: nil, industry: nil, size_range: nil,
                annual_revenue: nil, description: nil, owner_id: nil, custom_data: nil)
      company = Current.account.companies.new(
        name: name,
        domain: domain,
        industry: industry,
        size_range: size_range,
        annual_revenue: annual_revenue,
        description: description,
        owner_id: owner_id,
        custom_data: custom_data || {}
      )

      if company.save
        { company: company, errors: [] }
      else
        { company: nil, errors: company.errors.full_messages }
      end
    end
  end
end
