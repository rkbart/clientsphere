module Types
  class BaseObject < GraphQL::Schema::Object
    field_class Types::BaseField
  end

  class BaseField < GraphQL::Schema::Field
    argument_class Types::BaseArgument
  end

  class BaseArgument < GraphQL::Schema::Argument
  end

  class BaseInputObject < GraphQL::Schema::InputObject
    argument_class Types::BaseArgument
  end

  class BaseEnum < GraphQL::Schema::Enum
  end

  class BaseScalar < GraphQL::Schema::Scalar
  end

  class BaseUnion < GraphQL::Schema::Union
  end
end
