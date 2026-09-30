module Mutations
  class DeleteDeal < BaseMutation
    argument :id, ID, required: true

    field :success, Boolean, null: false

    def resolve(id:)
      deal = Current.account.deals.find(id)
      deal.discard!
      { success: true }
    end
  end
end
