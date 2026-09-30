module Mutations
  class DeleteContact < BaseMutation
    argument :id, ID, required: true

    field :success, Boolean, null: false

    def resolve(id:)
      contact = Current.account.contacts.find(id)
      contact.discard!
      { success: true }
    end
  end
end
