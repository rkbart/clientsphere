module Types
  class DealType < Types::BaseObject
    field :id, ID, null: false
    field :title, String, null: false
    field :amount, Float, null: true
    field :currency, String, null: true
    field :source, String, null: true
    field :probability, Integer, null: true
    field :expected_close_date, GraphQL::Types::ISO8601Date, null: true
    field :closed_at, GraphQL::Types::ISO8601DateTime, null: true
    field :pipeline, Types::PipelineType, null: true
    field :stage, Types::StageType, null: true
    field :contact, Types::ContactType, null: true
    field :company, Types::CompanyType, null: true
    field :owner, Types::UserType, null: true
    field :custom_data, GraphQL::Types::JSON, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
