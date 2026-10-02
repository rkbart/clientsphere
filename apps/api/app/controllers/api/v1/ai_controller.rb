class Api::V1::AiController < Api::V1::BaseController
  before_action :authorize_ai
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

  private

  def authorize_ai
    authorize AiSetting
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
