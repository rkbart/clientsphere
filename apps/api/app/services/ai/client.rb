module Ai
  class Client
    EMAIL_PATTERN = /\b[\w.%+-]+@[\w.-]+\.\w{2,}\b/
    PHONE_PATTERN = /\+?\d[\d\s().-]{7,}\d/
    SECRET_PATTERN = /\b(?:sk|key|token)[-_][A-Za-z0-9_-]{8,}\b/

    def initialize(ai_setting)
      @setting = ai_setting
      @provider = ai_setting.provider.to_s
    end

    def test_connection
      call("test_connection", Prompts.test, "Reply with exactly: ok")
      { success: true, message: "Connected (#{@provider} · #{@setting.model})." }
    rescue Ai::Error => e
      { success: false, message: e.message }
    end

    def chat(message, context = nil)
      call("chat", Prompts.chat(context || {}), message.to_s)
    end

    def draft_email(contact, purpose, context = nil)
      call("draft_email", Prompts.draft_email(contact, purpose, context), "Write the email now.")
    end

    def suggest_next_action(record)
      call("suggest_next_action", Prompts.suggest_next_action(record), "Suggest the next action.")
    end

    def enrich_company(domain)
      raw = call("enrich_company", Prompts.enrich_company(domain), "Return the JSON now.")
      JSON.parse(raw)
    rescue JSON::ParserError
      raise Ai::Error, "The model did not return valid JSON. Try again."
    end

    def summarize_deal(deal)
      activities = deal.activities.order(created_at: :desc).limit(10)
      call("summarize_deal", Prompts.summarize_deal(deal, activities), "Summarize the deal now.")
    end

    # Applies the redaction toggle to a prompt pair without invoking the
    # provider — used by browser-direct mode.
    def prepare(system_prompt, user_prompt)
      [mask_pii(system_prompt), mask_pii(user_prompt)]
    end

    private

    def call(action, system_prompt, user_prompt)
      started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      system_prompt = mask_pii(system_prompt)
      user_prompt = mask_pii(user_prompt)
      response = invoke(system_prompt, user_prompt)
      raise Ai::Error, "The provider returned an empty response." if response.blank?

      log(action, success: true, duration_ms: elapsed_since(started))
      response
    rescue Ai::Error => e
      log(action, success: false, duration_ms: elapsed_since(started), error: e.message)
      raise
    rescue StandardError => e
      log(action, success: false, duration_ms: elapsed_since(started), error: e.class.name)
      raise Ai::Error, friendly_message(e)
    end

    def invoke(system_prompt, user_prompt)
      if anthropic?
        invoke_anthropic(system_prompt, user_prompt)
      else
        invoke_openai_compatible(system_prompt, user_prompt)
      end
    end

    def invoke_openai_compatible(system_prompt, user_prompt)
      options = { api_key: @setting.api_key.presence || "not-needed" }
      options[:base_url] = @setting.base_url if @setting.base_url.present?
      client = OpenAI::Client.new(**options)
      response = client.chat.completions.create(
        model: @setting.model,
        max_tokens: 1024,
        messages: [
          { role: "system", content: system_prompt },
          { role: "user", content: user_prompt }
        ]
      )
      response.choices.first&.message&.content
    end

    def invoke_anthropic(system_prompt, user_prompt)
      client = Anthropic::Client.new(api_key: @setting.api_key)
      response = client.messages.create(
        model: @setting.model,
        max_tokens: 1024,
        system: system_prompt,
        messages: [{ role: "user", content: user_prompt }]
      )
      response.content.filter_map { |block| block.text if block.respond_to?(:text) }.first
    end

    def anthropic?
      @provider == "anthropic"
    end

    def mask_pii(text)
      return text unless @setting.redact_pii?

      text.to_s.gsub(EMAIL_PATTERN, "[redacted-email]").gsub(PHONE_PATTERN, "[redacted-phone]")
    end

    def friendly_message(error)
      message = error.message.to_s.gsub(SECRET_PATTERN, "[redacted]").truncate(300)
      "AI request failed (#{error.class.name.split('::').last}): #{message}"
    end

    def log(action, success:, duration_ms:, error: nil)
      AiLog.create!(
        account: @setting.account,
        action: action,
        provider: @provider,
        model: @setting.model,
        success: success,
        duration_ms: duration_ms,
        error: error&.to_s&.truncate(255)
      )
    rescue StandardError
      nil
    end

    def elapsed_since(started)
      ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started) * 1000).round
    end
  end
end
