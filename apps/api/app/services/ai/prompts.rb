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

    def self.draft_email(contact, purpose, context = nil)
      purpose = purpose.presence || "follow-up"
      extra = context.present? ? "\nAdditional context:\n#{dump(context)}" : ''
      <<~PROMPT
        #{BASE}
        Write a #{purpose} email to #{contact.full_name}.
        Return ONLY the email text: a subject line ("Subject: ..."), a blank line, then the body.
        Keep it under 150 words unless asked otherwise.

        Contact:
        #{dump(contact_payload(contact))}#{extra}
      PROMPT
    end

    def self.suggest_next_action(record)
      <<~PROMPT
        #{BASE}
        Suggest ONE concrete next action for this #{record.class.name.downcase}.
        It must be specific (who, what, when) and take under 15 minutes to start.
        Reply with a single sentence.

        Record:
        #{dump(record_payload(record))}
      PROMPT
    end

    def self.enrich_company(domain)
      <<~PROMPT
        #{BASE}
        Describe the company behind #{domain} using public knowledge.
        Return ONLY a JSON object with keys: name, industry, description, size_range (like "11-50"),
        annual_revenue (number or null). No markdown, no commentary.
      PROMPT
    end

    def self.summarize_deal(deal, activities)
      <<~PROMPT
        #{BASE}
        Summarize this deal in 3 short bullet points: where it stands, what happened so far,
        and the main risk or next step.

        Deal:
        #{dump(deal_payload(deal))}

        Recent activity:
        #{dump(activity_list(activities))}
      PROMPT
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

    def self.record_payload(record)
      payload =
        case record
        when Contact then contact_payload(record)
        when Deal then deal_payload(record)
        when Company then company_payload(record)
        else { type: record.class.name, id: record.id }
        end
      payload[:recent_activities] = activity_list(record.activities.order(created_at: :desc).limit(5)) if record.respond_to?(:activities)
      payload
    end

    def self.company_payload(company)
      {
        name: company.name,
        domain: company.domain,
        industry: company.industry,
        size_range: company.size_range,
        annual_revenue: company.annual_revenue,
        description: company.description
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

    private_class_method :record_payload, :company_payload, :dump
  end
end
