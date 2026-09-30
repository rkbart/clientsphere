module Mutations
  class DeleteCompany < BaseMutation
    argument :id, ID, required: true

    field :success, Boolean, null: false

    def resolve(id:)
      company = Current.account.companies.find(id)
      company.discard!
      { success: true }
    end
  end
end
