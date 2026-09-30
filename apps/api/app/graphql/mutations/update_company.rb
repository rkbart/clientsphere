module Mutations
  class UpdateCompany < BaseMutation
    argument :id, ID, required: true
    argument :name, String, required: false
    argument :domain, String, required: false
    argument :industry, String, required: false
    argument :size_range, String, required: false
    argument :annual_revenue, Float, required: false
    argument :description, String, required: false
    argument :owner_id, ID, required: false
    argument :custom_data, GraphQL::Types::JSON, required: false

    field :company, Types::CompanyType, null: true
    field :errors, [String], null: false

    def resolve(id:, **attrs)
      company = Current.account.companies.find(id)
      if company.update(attrs.compact)
        { company: company, errors: [] }
      else
        { company: nil, errors: company.errors.full_messages }
      end
    end
  end
end
