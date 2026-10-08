module Types
  class ContactType < Types::BaseObject
    field :id, ID, null: false
    field :first_name, String, null: false
    field :last_name, String, null: true
    field :email, String, null: true
    field :phone, String, null: true
    field :status, String, null: false
    field :source, String, null: true
    field :lead_score, Integer, null: false
    field :score_reasons, [String], null: false
    field :company, Types::CompanyType, null: true
    field :owner, Types::UserType, null: true
    field :billing_address, GraphQL::Types::JSON, null: false
    field :shipping_address, GraphQL::Types::JSON, null: false
    field :custom_data, GraphQL::Types::JSON, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
