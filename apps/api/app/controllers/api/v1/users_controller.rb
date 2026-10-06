class Api::V1::UsersController < Api::V1::BaseController
  # Self-service: set display name, contact phone and/or password, dismiss the
  # first-login setup modal. Invitees arrive with a random server-generated
  # password, so this is how they take control of their own credentials.
  # Email is identity (invitation + login key) and is never editable here.
  # Workspace rename is scoped to fresh Google signups: Google auto-creates a
  # "<name>'s workspace" the user never chose, so onboarding offers a rename.
  # It only applies when the caller owns the workspace alone — teammates must
  # never rename a shared workspace from a personal setup form.
  def me
    user = Current.user
    authorize user, :me?
    apply_name(user)
    apply_phone(user)
    apply_password(user)
    user.welcome_seen_at = Time.current if params[:welcome_seen].to_s == "true"
    ApplicationRecord.transaction do
      user.save!
      apply_account_name(user)
    end
    render json: user.as_json.merge("account_name" => Current.account&.name)
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages }, status: :unprocessable_entity
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

  def apply_account_name(user)
    return unless params.key?(:account_name)

    name = params[:account_name].to_s.strip
    return if name.blank?
    return unless Current.account
    return unless Current.account.users.one?
    return unless user.role_for(Current.account) == "owner"

    Current.account.name = name
    Current.account.save!
  end

  def apply_password(user)
    return unless params[:password].present?

    user.password = params[:password]
    user.password_confirmation = params[:password_confirmation]
  end
end
