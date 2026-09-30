module Types
  class ActivityType < Types::BaseObject
    field :id, ID, null: false
    field :kind, String, null: false
    field :subject, String, null: false
    field :description, String, null: true
    field :due_at, GraphQL::Types::ISO8601DateTime, null: true
    field :completed_at, GraphQL::Types::ISO8601DateTime, null: true
    field :contact, Types::ContactType, null: true
    field :company, Types::CompanyType, null: true
    field :deal, Types::DealType, null: true
    field :creator, Types::UserType, null: false
    field :assignee, Types::UserType, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
