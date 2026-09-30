module Mutations
  class DeleteActivity < BaseMutation
    argument :id, ID, required: true

    field :success, Boolean, null: false

    def resolve(id:)
      activity = Current.account.activities.find(id)
      activity.destroy!
      { success: true }
    end
  end
end
