module Mutations
  class CreateActivity < BaseMutation
    argument :kind, String, required: true
    argument :subject, String, required: true
    argument :description, String, required: false
    argument :due_at, GraphQL::Types::ISO8601DateTime, required: false
    argument :contact_id, ID, required: false
    argument :company_id, ID, required: false
    argument :deal_id, ID, required: false
    argument :assignee_id, ID, required: false

    field :activity, Types::ActivityType, null: true
    field :errors, [String], null: false

    def resolve(kind:, subject:, description: nil, due_at: nil, contact_id: nil,
                company_id: nil, deal_id: nil, assignee_id: nil)
      activity = Current.account.activities.new(
        kind: kind,
        subject: subject,
        description: description,
        due_at: due_at,
        contact_id: contact_id,
        company_id: company_id,
        deal_id: deal_id,
        assignee_id: assignee_id,
        creator: Current.user
      )

      if activity.save
        { activity: activity, errors: [] }
      else
        { activity: nil, errors: activity.errors.full_messages }
      end
    end
  end
end
