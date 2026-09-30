class Api::V1::AuthController < Api::V1::BaseController
  skip_before_action :set_current_account_and_user, only: [:signup, :login, :providers]
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped

  # Lets the frontend show/hide the "Continue with Google" button.
  def providers
    render json: {
      google: ENV["GOOGLE_CLIENT_ID"].present? && ENV["GOOGLE_CLIENT_SECRET"].present?,
    }
  end

  def signup
    user = User.new(signup_params)
    account = Account.create!(name: params[:account_name])
    Membership.create!(user: user, account: account, role: :owner)
    user.current_account = account
    user.save!

    session = Session.create!(user: user, ip_address: request.remote_ip, user_agent: request.user_agent)
    render json: { token: session.token, user: user, account: account }, status: :created
  end

  def login
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      session = Session.create!(user: user, ip_address: request.remote_ip, user_agent: request.user_agent)
      render json: { token: session.token, user: user, account: user.current_account }
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def logout
    current_session = Session.find_by(token_digest: Digest::SHA256.hexdigest(request.headers["Authorization"]&.split(" ")&.last))
    current_session&.destroy!
    head :no_content
  end

  def me
    render json: { user: Current.user, account: Current.account, memberships: Current.user.memberships }
  end

  def switch_account
    account = Account.find(params[:account_id])
    Current.user.switch_account!(account)
    render json: { account: account }
  end

  private

  def signup_params
    params.require(:user).permit(:email, :password, :name)
  end
end
