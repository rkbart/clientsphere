class Api::V1::InvitationsController < Api::V1::BaseController
  # Accept is public: invitees follow an emailed link without a session.
  # The token digest lookup is unguessable, same as unsubscribe links.
  skip_before_action :set_current_account_and_user, only: [:accept]
  skip_after_action :verify_authorized, only: [:accept]
  def create
    invitation = Invitation.new(invitation_params)
    invitation.invited_by = Current.user
    invitation.account = Current.account
    authorize invitation
    invitation.save!
    sent = Invitations::Notifier.send_invite(invitation, invitation.token)
    render json: invitation.as_json.except("token_digest").merge(
      "token" => invitation.token, "invite_sent" => sent
    ), status: :created
  end

  def accept
    # Member route, so the token arrives as params[:id].
    invitation = Invitation.find_by(token_digest: Digest::SHA256.hexdigest(params[:id].to_s))
    return render json: { error: "Invalid invitation" }, status: :not_found unless invitation
    return render json: { error: "Invitation expired" }, status: :unprocessable_entity if invitation.expired?

    user = User.find_or_create_by!(email: invitation.email) do |u|
      u.password = SecureRandom.hex(16)
      u.name = invitation.email.split("@").first
    end

    invitation.accept!(user)
    session = Session.create!(user: user, ip_address: request.remote_ip, user_agent: request.user_agent)
    render json: { token: session.token, user: user, account: invitation.account }
  end

  private

  def invitation_params
    params.require(:invitation).permit(:email, :role)
  end
end
