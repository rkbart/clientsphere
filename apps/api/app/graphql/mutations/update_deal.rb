module Mutations
  class UpdateDeal < BaseMutation
    argument :id, ID, required: true
    argument :title, String, required: false
    argument :amount, Float, required: false
    argument :currency, String, required: false
    argument :source, String, required: false
    argument :probability, Integer, required: false
    argument :expected_close_date, GraphQL::Types::ISO8601Date, required: false
    argument :pipeline_id, ID, required: false
    argument :stage_id, ID, required: false
    argument :contact_id, ID, required: false
    argument :company_id, ID, required: false
    argument :owner_id, ID, required: false
    argument :custom_data, GraphQL::Types::JSON, required: false

    field :deal, Types::DealType, null: true
    field :errors, [String], null: false

    def resolve(id:, **attrs)
      deal = Current.account.deals.find(id)
      if deal.update(attrs.compact)
        { deal: deal, errors: [] }
      else
        { deal: nil, errors: deal.errors.full_messages }
      end
    end
  end
end
