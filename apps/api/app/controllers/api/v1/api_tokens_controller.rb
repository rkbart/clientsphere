class Api::V1::ApiTokensController < Api::V1::BaseController
  def index
    tokens = policy_scope(ApiToken).order(created_at: :desc)

    render json: tokens.as_json(except: "token_digest")
  end

  def create
    token = ApiToken.new(api_token_params)
    token.account = Current.account
    token.user = Current.user
    authorize token
    token.save!
    render json: token.as_json(except: "token_digest").merge("token" => token.token),
           status: :created
  end

  def destroy
    token = Current.account.api_tokens.find(params[:id])
    authorize token
    token.destroy!
    head :no_content
  end

  private

  def api_token_params
    params.require(:api_token).permit(:name, :expires_at)
  end
end
