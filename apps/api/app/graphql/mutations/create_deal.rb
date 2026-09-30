module Mutations
  class CreateDeal < BaseMutation
    argument :title, String, required: true
    argument :amount, Float, required: false
    argument :currency, String, required: false
    argument :source, String, required: false
    argument :probability, Integer, required: false
    argument :expected_close_date, GraphQL::Types::ISO8601Date, required: false
    argument :pipeline_id, ID, required: true
    argument :stage_id, ID, required: true
    argument :contact_id, ID, required: false
    argument :company_id, ID, required: false
    argument :owner_id, ID, required: false
    argument :custom_data, GraphQL::Types::JSON, required: false

    field :deal, Types::DealType, null: true
    field :errors, [String], null: false

    def resolve(title:, pipeline_id:, stage_id:, amount: nil, currency: nil, source: nil, probability: nil,
                expected_close_date: nil, contact_id: nil,
                company_id: nil, owner_id: nil, custom_data: nil)
      deal = Current.account.deals.new(
        title: title,
        amount: amount,
        currency: currency,
        source: source,
        probability: probability,
        expected_close_date: expected_close_date,
        pipeline_id: pipeline_id,
        stage_id: stage_id,
        contact_id: contact_id,
        company_id: company_id,
        owner_id: owner_id,
        custom_data: custom_data || {}
      )

      if deal.save
        { deal: deal, errors: [] }
      else
        { deal: nil, errors: deal.errors.full_messages }
      end
    end
  end
end
