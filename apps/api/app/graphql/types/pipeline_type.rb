module Types
  class PipelineType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :is_default, Boolean, null: false
    field :stages, [Types::StageType], null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
