module Types
  class StageType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :position, Integer, null: false
    field :color, String, null: true
    field :probability, Integer, null: true
    field :kind, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
