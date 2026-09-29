module Ai
  class Client
    def initialize(ai_setting)
      @setting = ai_setting
      @provider = ai_setting.provider
    end

    def test_connection
      response = chat("Reply with exactly: ok", "ok")
      { success: true, message: "Connected." }
    rescue => e
      { success: false, message: e.message }
    end

    def chat(message, context = nil)
      system_prompt = PROMPTS.chat(context || {})
      call_provider(system_prompt, message)
    end

    def draft_email(contact, purpose, context = nil)
      system_prompt = PROMPTS.draft_email(contact, purpose, context)
      call_provider(system_prompt, "Draft email")
    end

    def suggest_next_action(record)
      system_prompt = PROMPTS.suggest_next_action(record)
      call_provider(system_prompt, "Suggest next action")
    end

    def enrich_company(domain)
      system_prompt = PROMPTS.enrich_company(domain)
      response = call_provider(system_prompt, "Enrich company")
      JSON.parse(response)
    rescue JSON::ParserError
      { error: "Failed to parse enrichment response" }
    end

    def summarize_deal(deal)
      activities = deal.activities.limit(10).order(created_at: :desc)
      system_prompt = PROMPTS.summarize_deal(deal, activities)
      call_provider(system_prompt, "Summarize deal")
    end

    private

    def call_provider(system_prompt, user_prompt)
      case @provider
      when "anthropic"
        call_anthropic(system_prompt, user_prompt)
      else
        call_openai_compatible(system_prompt, user_prompt)
      end
    end

    def call_openai_compatible(system_prompt, user_prompt)
      client = OpenAI::Client.new(
        access_token: @setting.api_key,
        uri_base: @setting.base_url
      )

      response = client.chat(
        parameters: {
          model: @setting.model,
          messages: [
            { role: "system", content: system_prompt },
            { role: "user", content: user_prompt }
          ]
        }
      )

      response.dig("choices", 0, "message", "content")
    end

    def call_anthropic(system_prompt, user_prompt)
      client = Anthropic::Client.new(api_key: @setting.api_key)

      response = client.messages(
        model: @setting.model,
        max_tokens: 4096,
        system: system_prompt,
        messages: [{ role: "user", content: user_prompt }]
      )

      response.content[0].text
    end

    def PROMPTS
      # This would be the prompts module
      OpenStruct.new(
        chat: ->(context) { "You are a CRM assistant. Context: #{context}" },
        draft_email: ->(contact, purpose, context) { "Draft a #{purpose} email to #{contact.full_name}" },
        suggest_next_action: ->(record) { "Suggest next action for #{record.class.name}" },
        enrich_company: ->(domain) { "Enrich company info for #{domain}" },
        summarize_deal: ->(deal, activities) { "Summarize deal: #{deal.title}" }
      )
    end
  end
end
