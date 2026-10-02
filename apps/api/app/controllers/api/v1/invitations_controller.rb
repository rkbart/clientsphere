class Api::V1::InvitationsController < Api::V1::BaseController
  # Accept is public: invitees follow an emailed link without a session.
  # The token digest lookup is unguessable, same as unsubscribe links.
  skip_before_action :set_current_account_and_user, only: [:accept]
  skip_after_action :verify_authorized, only: [:accept]
  def index
    invitations = policy_scope(Invitation).where(accepted_at: nil).order(created_at: :desc)
    render json: invitations.as_json(except: "token_digest")
  end

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

  def destroy
    invitation = Current.account.invitations.find(params[:id])
    authorize invitation
    invitation.destroy!
    head :no_content
  end

  def accept
    # Member route, so the token arrives as params[:id].
    invitation = Invitation.find_by(token_digest: Digest::SHA256.hexdigest(params[:id].to_s))
    return render json: { error: "Invalid invitation" }, status: :not_found unless invitation
    return render json: { error: "Invitation expired" }, status: :unprocessable_entity if invitation.expired?
    return render json: { error: "Invitation already accepted" }, status: :unprocessable_entity if invitation.accepted_at.present?

    user = User.find_or_initialize_by(email: invitation.email)
    if user.persisted? && Membership.exists?(account: invitation.account, user: user)
      return render json: { error: "Already a workspace member" }, status: :unprocessable_entity
    end
    if user.new_record?
      user.password = SecureRandom.hex(16)
      user.name = invitation.email.split("@").first
      user.save!
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
