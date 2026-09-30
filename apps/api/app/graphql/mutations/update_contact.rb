module Mutations
  class UpdateContact < BaseMutation
    argument :id, ID, required: true
    argument :first_name, String, required: false
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

    def resolve(id:, **attrs)
      contact = Current.account.contacts.find(id)
      if contact.update(attrs.compact)
        { contact: contact, errors: [] }
      else
        { contact: nil, errors: contact.errors.full_messages }
      end
    end
  end
end
