module Mutations
  class UpdateActivity < BaseMutation
    argument :id, ID, required: true
    argument :kind, String, required: false
    argument :subject, String, required: false
    argument :description, String, required: false
    argument :due_at, GraphQL::Types::ISO8601DateTime, required: false
    argument :completed_at, GraphQL::Types::ISO8601DateTime, required: false
    argument :contact_id, ID, required: false
    argument :company_id, ID, required: false
    argument :deal_id, ID, required: false
    argument :assignee_id, ID, required: false

    field :activity, Types::ActivityType, null: true
    field :errors, [String], null: false

    def resolve(id:, **attrs)
      activity = Current.account.activities.find(id)
      if activity.update(attrs.compact)
        { activity: activity, errors: [] }
      else
        { activity: nil, errors: activity.errors.full_messages }
      end
    end
  end
end
