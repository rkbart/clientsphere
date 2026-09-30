module Types
  class BaseInterface < GraphQL::Schema::Interface
    field_class Types::BaseField
  end
end
