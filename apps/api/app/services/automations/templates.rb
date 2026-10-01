module Automations
  # Ready-made automation blueprints. Every template uses only actions that
  # need no existing records (no stage/webhook ids), so it can be saved
  # as-is straight from the template gallery and customized afterwards.
  module Templates
    ALL = [
      {
        key: "welcome_new_contact",
        name: "Welcome new contact",
        description: "Send a welcome email the moment a contact is created.",
        trigger_type: "contact_created",
        delay_days: 0,
        conditions: {},
        actions: [
          { "type" => "send_email", "subject" => "Welcome!", "body" => "Thanks for getting in touch — we're glad you're here." }
        ]
      },
      {
        key: "new_lead_followup",
        name: "New lead follow-up",
        description: "Tag the lead and queue a follow-up task one day after creation.",
        trigger_type: "contact_created",
        delay_days: 1,
        conditions: { "status" => "lead" },
        actions: [
          { "type" => "add_tag", "tag_name" => "new-lead" },
          { "type" => "create_task", "subject" => "Follow up with new lead", "description" => "Reach out within 24 hours.", "due_days" => "1" }
        ]
      },
      {
        key: "big_deal_alert",
        name: "Big deal alert",
        description: "Create an urgent task when a deal over $5,000 is created.",
        trigger_type: "deal_created",
        delay_days: 0,
        conditions: { "min_amount" => "5000" },
        actions: [
          { "type" => "create_task", "subject" => "High-value deal needs attention", "description" => "Call the contact today.", "due_days" => "1" }
        ]
      },
      {
        key: "deal_won_thank_you",
        name: "Deal won thank-you",
        description: "Thank the customer and tag them when a deal is won.",
        trigger_type: "deal_won",
        delay_days: 0,
        conditions: {},
        actions: [
          { "type" => "send_email", "subject" => "Thank you for your business", "body" => "We're excited to work with you!" },
          { "type" => "add_tag", "tag_name" => "customer" }
        ]
      },
      {
        key: "lost_deal_winback",
        name: "Lost deal win-back",
        description: "Re-engage 30 days after a deal is lost with an email and a task.",
        trigger_type: "deal_lost",
        delay_days: 30,
        conditions: {},
        actions: [
          { "type" => "send_email", "subject" => "We'd love to work with you", "body" => "Checking in — has anything changed on your end?" },
          { "type" => "create_task", "subject" => "Re-engage lost deal", "description" => "Call with a fresh offer.", "due_days" => "2" }
        ]
      },
      {
        key: "overdue_nudge",
        name: "Overdue activity nudge",
        description: "Queue a follow-up task when an activity goes overdue.",
        trigger_type: "activity_overdue",
        delay_days: 0,
        conditions: {},
        actions: [
          { "type" => "create_task", "subject" => "Overdue activity needs attention", "description" => "Catch up on the missed activity.", "due_days" => "1" }
        ]
      }
    ].freeze

    def self.all
      ALL.map(&:deep_dup)
    end
  end
end
