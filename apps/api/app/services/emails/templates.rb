module Emails
  # Ready-made email blueprints. Bodies use {{first_name}}, {{last_name}},
  # {{email}} and {{company}} placeholders, interpolated per contact by
  # EmailsController#templates via EmailService.interpolate.
  module Templates
    ALL = [
      {
        key: "follow_up",
        name: "Follow-up",
        subject: "Following up",
        body: "Hi {{first_name}},\n\nJust checking in to see if you had any thoughts on our last conversation.\n\nHappy to answer any questions.\n\nBest regards"
      },
      {
        key: "introduction",
        name: "Introduction",
        subject: "Introduction from {{company}}",
        body: "Hi {{first_name}},\n\nI'm reaching out from {{company}} because I think we can help with what you're working on.\n\nWould you be open to a brief call next week?\n\nBest regards"
      },
      {
        key: "proposal",
        name: "Proposal",
        subject: "Proposal for {{company}}",
        body: "Hi {{first_name}},\n\nAs discussed, please find our proposal attached to this thread.\n\nThe quote is valid for 30 days — let me know if you'd like to walk through it together.\n\nBest regards"
      },
      {
        key: "check_in",
        name: "Check-in",
        subject: "Quick check-in",
        body: "Hi {{first_name}},\n\nIt's been a while — how are things going on your end?\n\nLet me know if there's anything I can help with.\n\nBest regards"
      },
      {
        key: "thank_you",
        name: "Thank-you",
        subject: "Thank you!",
        body: "Hi {{first_name}},\n\nThank you for your business — we're excited to work with you.\n\nYou'll hear from us shortly with next steps.\n\nBest regards"
      },
      {
        key: "win_back",
        name: "Win-back",
        subject: "We'd love to work with you again",
        body: "Hi {{first_name}},\n\nIt's been some time since we last spoke. A lot has improved on our end — would you be open to a fresh conversation?\n\nBest regards"
      }
    ].freeze

    def self.all
      ALL.map(&:deep_dup)
    end
  end
end
