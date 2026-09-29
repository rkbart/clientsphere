class Api::V1::AiController < Api::V1::BaseController
  before_action :authorize_ai
  before_action :require_ai_enabled, only: [:prompts, :chat, :draft_email, :suggest_next_action, :enrich, :summarize_deal]

  rescue_from Ai::Error, with: :ai_error

  def settings
    render json: settings_payload(Current.account.ai_setting)
  end

  def update_settings
    setting = Current.account.ai_setting || Current.account.build_ai_setting
    attributes = ai_settings_params
    attributes = attributes.except(:api_key) if attributes[:api_key].blank?
    setting.assign_attributes(attributes)
    setting.save!
    render json: settings_payload(setting)
  end

  def test_connection
    setting = Current.account.ai_setting
    return render json: { success: false, message: "AI is not configured yet." }, status: :unprocessable_entity unless setting

    render json: setting.test_connection!
  end

  # Returns the assembled prompts without calling the provider, so the browser
  # can send them directly to a local model (browser-direct mode).
  def prompts
    system, user =
      case params[:kind]
      when "chat"
        context = Ai::Context.new(Current.account, params[:message]).chat
        [Ai::Prompts.chat(context), params[:message].to_s]
      when "draft_email"
        contact = find_in_account(Contact, params[:contact_id])
        [Ai::Prompts.draft_email(contact, params[:purpose], draft_deal_context), "Write the email now."]
      else
        raise Ai::Error, "Unknown prompt kind."
      end
    system_prompt, user_prompt = ai_client.prepare(system, user)
    render json: { system_prompt: system_prompt, user_prompt: user_prompt }
  end

  def chat
    context = Ai::Context.new(Current.account, params[:message]).chat
    render json: { response: ai_client.chat(params[:message], context) }
  end

  def draft_email
    contact = find_in_account(Contact, params[:contact_id])
    render json: { draft: ai_client.draft_email(contact, params[:purpose], draft_deal_context) }
  end

  def suggest_next_action
    record = find_record(params[:record_type], params[:record_id])
    render json: { suggestion: ai_client.suggest_next_action(record) }
  end

  def enrich
    render json: ai_client.enrich_company(params[:domain])
  end

  def summarize_deal
    deal = find_in_account(Deal, params[:deal_id])
    render json: { summary: ai_client.summarize_deal(deal) }
  end

  private

  def draft_deal_context
    return nil if params[:deal_id].blank?

    deal = find_in_account(Deal, params[:deal_id])
    {
      deal: Ai::Prompts.deal_payload(deal),
      recent_activities: Ai::Prompts.activity_list(deal.activities.order(created_at: :desc).limit(5))
    }
  end

  def authorize_ai
    authorize AiSetting
  end

  def require_ai_enabled
    setting = Current.account.ai_setting
    return render json: { error: "AI is not configured yet." }, status: :unprocessable_entity unless setting
    return render json: { error: "AI is turned off. Turn it on in Settings → AI." }, status: :unprocessable_entity unless setting.enabled?

    setting
  end

  def ai_client
    Ai::Client.new(Current.account.ai_setting)
  end

  def settings_payload(setting)
    return { provider: nil, model: nil, base_url: nil, enabled: false, redact_pii: false, api_key_set: false } unless setting

    setting.as_json(except: :api_key).merge("api_key_set" => setting.api_key.present?)
  end

  def ai_settings_params
    params.require(:ai_setting).permit(:provider, :model, :base_url, :api_key, :enabled, :redact_pii)
  end

  def find_in_account(model, id)
    model.where(account: Current.account).find(id)
  end

  def find_record(type, id)
    klass = { "Contact" => Contact, "Deal" => Deal, "Company" => Company }[type]
    raise ActiveRecord::RecordNotFound unless klass

    find_in_account(klass, id)
  end

  def ai_error(exception)
    render json: { error: exception.message }, status: :unprocessable_entity
  end
end
