module Ai
  module Prompts
    BASE = <<~PROMPT.freeze
      You are ClientSphere's CRM assistant for small businesses — cafes, freelancers, consultants, agencies.
      Ground every answer in the CRM context provided. Never invent contacts, amounts, dates or outcomes.
      Keep answers short and actionable. When the context does not contain the answer, say what is missing.
    PROMPT

    def self.test
      "Reply with exactly: ok"
    end

    def self.chat(context)
      "#{BASE}\n\nCRM context:\n#{dump(context)}"
    end

    def self.contact_payload(contact)
      {
        full_name: contact.full_name,
        email: contact.email,
        phone: contact.phone,
        status: contact.status,
        lead_score: contact.lead_score,
        company: contact.company&.name
      }
    end

    def self.deal_payload(deal)
      {
        title: deal.title,
        amount: deal.amount.to_f,
        currency: deal.currency,
        stage: deal.stage&.name,
        expected_close_date: deal.expected_close_date,
        probability: deal.probability,
        closed_at: deal.closed_at
      }
    end

    def self.activity_list(activities)
      activities.map do |activity|
        { kind: activity.kind, subject: activity.subject, due_at: activity.due_at, completed_at: activity.completed_at }
      end
    end

    def self.dump(value)
      JSON.pretty_generate(value).truncate(6000)
    rescue StandardError
      value.to_s.truncate(6000)
    end

    private_class_method :dump
  end
end
