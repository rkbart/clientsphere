module Mutations
  class CreateContact < BaseMutation
    argument :first_name, String, required: true
    argument :last_name, String, required: false
    argument :email, String, required: false
    argument :phone, String, required: false
    argument :status, String, required: false
    argument :source, String, required: false
    argument :company_id, ID, required: false
    argument :owner_id, ID, required: false
    argument :custom_data, GraphQL::Types::JSON, required: false

    field :contact, Types::ContactType, null: true
    field :errors, [String], null: false

    def resolve(first_name:, last_name: nil, email: nil, phone: nil, status: nil,
                source: nil, company_id: nil, owner_id: nil, custom_data: nil)
      contact = Current.account.contacts.new(
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone: phone,
        status: status || "lead",
        source: source,
        company_id: company_id,
        owner_id: owner_id,
        custom_data: custom_data || {}
      )

      if contact.save
        { contact: contact, errors: [] }
      else
        { contact: nil, errors: contact.errors.full_messages }
      end
    end
  end
end
