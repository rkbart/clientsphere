class Api::V1::PasswordResetsController < Api::V1::BaseController
  # Public: a locked-out user has no session. Both actions are deliberately
  # unauthenticated and skip Pundit (no tenant record to authorize against).
  skip_before_action :set_current_account_and_user
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped

  # Always responds 200 so the endpoint cannot be used to enumerate accounts.
  def create
    user = User.find_by(email: params[:email].to_s.strip.downcase)
    if user
      # One live reset at a time: supersede anything still outstanding.
      user.password_resets.usable.update_all(used_at: Time.current)
      password_reset = user.password_resets.create!
      PasswordResets::Notifier.send_reset(password_reset, password_reset.token)
    end
    render json: {
      message: "If that email exists, a password reset link is on its way."
    }, status: :created
  end

  # Member route: the raw token arrives as params[:password_reset_id].
  def update
    password_reset = PasswordReset.find_by(
      token_digest: Digest::SHA256.hexdigest(params[:password_reset_id].to_s)
    )
    return render json: { error: "Invalid or expired reset link" }, status: :not_found unless password_reset
    return render json: { error: "Invalid or expired reset link" }, status: :unprocessable_entity unless password_reset.usable?

    user = password_reset.user
    user.password = params[:password].to_s
    user.password_confirmation = params[:password_confirmation]
    # Choosing a password here is exactly what the first-login modal asks for,
    # so don't prompt them again on next sign-in.
    user.welcome_seen_at = Time.current
    if user.save
      password_reset.update!(used_at: Time.current)
      # A password change invalidates every existing session for that user.
      user.sessions.destroy_all
      render json: { message: "Password updated. You can sign in now." }
    else
      render json: { error: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
