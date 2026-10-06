class Api::V1::UsersController < Api::V1::BaseController
  # Self-service: set display name, contact phone and/or password, dismiss the
  # first-login setup modal. Invitees arrive with a random server-generated
  # password, so this is how they take control of their own credentials.
  # Email is identity (invitation + login key) and is never editable here.
  def me
    user = Current.user
    authorize user, :me?
    apply_name(user)
    apply_phone(user)
    apply_password(user)
    user.welcome_seen_at = Time.current if params[:welcome_seen].to_s == "true"
    if user.save
      render json: user
    else
      render json: { error: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def apply_name(user)
    user.name = params[:name].to_s.strip if params.key?(:name)
  end

  def apply_phone(user)
    return unless params.key?(:phone)

    phone = params[:phone].to_s.strip
    user.phone = phone.presence
  end

  def apply_password(user)
    return unless params[:password].present?

    user.password = params[:password]
    user.password_confirmation = params[:password_confirmation]
  end
end
