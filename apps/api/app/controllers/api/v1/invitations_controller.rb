class Api::V1::InvitationsController < Api::V1::BaseController
  def create
    invitation = Invitation.new(invitation_params)
    invitation.invited_by = Current.user
    invitation.account = Current.account
    authorize invitation
    invitation.save!
    render json: invitation, status: :created
  end

  def accept
    invitation = Invitation.find_by(token_digest: Digest::SHA256.hexdigest(params[:token]))
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
