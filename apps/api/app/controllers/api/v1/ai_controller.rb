class Api::V1::AiController < Api::V1::BaseController
  def settings
    setting = Current.account.ai_setting
    render json: setting || { provider: nil, model: nil, enabled: false }
  end

  def update_settings
    setting = Current.account.ai_setting || Current.account.build_ai_setting
    setting.assign_attributes(ai_settings_params)
    setting.save!
    render json: setting
  end

  def test_connection
    setting = Current.account.ai_setting
    return render json: { error: "AI not configured" }, status: :unprocessable_entity unless setting

    result = setting.test_connection!
    render json: { success: result[:success], message: result[:message] }
  end

  def chat
    setting = Current.account.ai_setting
    return render json: { error: "AI not configured" }, status: :unprocessable_entity unless setting

    result = Ai::Client.new(setting).chat(params[:message], params[:context])
    render json: { response: result }
  end

  def draft_email
    setting = Current.account.ai_setting
    return render json: { error: "AI not configured" }, status: :unprocessable_entity unless setting

    contact = Contact.find(params[:contact_id])
    result = Ai::Client.new(setting).draft_email(contact, params[:purpose], params[:context])
    render json: { draft: result }
  end

  def suggest_next_action
    setting = Current.account.ai_setting
    return render json: { error: "AI not configured" }, status: :unprocessable_entity unless setting

    record = find_record(params[:record_type], params[:record_id])
    result = Ai::Client.new(setting).suggest_next_action(record)
    render json: { suggestion: result }
  end

  def enrich
    setting = Current.account.ai_setting
    return render json: { error: "AI not configured" }, status: :unprocessable_entity unless setting

    result = Ai::Client.new(setting).enrich_company(params[:domain])
    render json: result
  end

  def summarize_deal
    setting = Current.account.ai_setting
    return render json: { error: "AI not configured" }, status: :unprocessable_entity unless setting

    deal = Deal.find(params[:deal_id])
    result = Ai::Client.new(setting).summarize_deal(deal)
    render json: { summary: result }
  end

  private

  def ai_settings_params
    params.require(:ai_setting).permit(:provider, :model, :base_url, :api_key, :enabled)
  end

  def find_record(type, id)
    case type
    when "Contact" then Contact.find(id)
    when "Deal" then Deal.find(id)
    when "Company" then Company.find(id)
    else raise ActiveRecord::RecordNotFound
    end
  end
end
