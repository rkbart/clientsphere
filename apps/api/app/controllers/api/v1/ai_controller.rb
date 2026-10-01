class Api::V1::AiController < Api::V1::BaseController
  before_action :authorize_ai
  before_action :require_ai_enabled, only: [:prompts, :chat]

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

  private

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

  def ai_error(exception)
    render json: { error: exception.message }, status: :unprocessable_entity
  end
end
