class Api::V1::MembershipsController < Api::V1::BaseController
  def index
    memberships = policy_scope(Membership)
    memberships = memberships.includes(:user)

    render json: memberships.as_json(include: { user: { only: [:id, :name, :email] } })
  end

  def update
    membership = Membership.find(params[:id])
    authorize membership
    unless Membership.roles.key?(params[:role].to_s)
      return render json: { error: "Invalid role." }, status: :unprocessable_entity
    end
    if params[:role] == "owner" && Current.user.role_for(Current.account) != "owner"
      return render json: { error: "Only owners can promote to owner." }, status: :forbidden
    end
    membership.update!(role: params[:role])
    render json: membership
  end

  def destroy
    membership = Membership.find(params[:id])
    authorize membership
    membership.destroy!
    head :no_content
  end
end
