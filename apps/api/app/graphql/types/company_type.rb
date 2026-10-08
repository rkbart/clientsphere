module Types
  class CompanyType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :domain, String, null: true
    field :industry, String, null: true
    field :size_range, String, null: true
    field :annual_revenue, Float, null: true
    field :description, String, null: true
    field :billing_address, GraphQL::Types::JSON, null: false
    field :shipping_address, GraphQL::Types::JSON, null: false
    field :owner, Types::UserType, null: true
    field :custom_data, GraphQL::Types::JSON, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
