class ClientSphereSchema < GraphQL::Schema
  query Types::QueryType
  mutation Types::MutationType

  use GraphQL::Batch

  def self.id_from_object(object, type_definition, query_ctx)
    GraphQL::Schema::UniqueWithinType.encode(type_definition.name, object.id)
  end

  def self.object_from_id(id, query_ctx)
    type_name, item_id = GraphQL::Schema::UniqueWithinType.decode(id)
    Object.const_get(type_name).find(item_id)
  end

  def self.resolve_type(type, obj, ctx)
    case obj
    when Contact then Types::ContactType
    when Company then Types::CompanyType
    when Deal then Types::DealType
    when Activity then Types::ActivityType
    when User then Types::UserType
    when Pipeline then Types::PipelineType
    when Stage then Types::StageType
    else
      raise "Unexpected object: #{obj}"
    end
  end
end
