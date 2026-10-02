class Api::V1::MembershipsController < Api::V1::BaseController
  def index
    memberships = policy_scope(Membership)
    memberships = memberships.includes(:user)

    render json: memberships.as_json(include: { user: { only: [:id, :name, :email] } })
  end

  def update
    membership = Membership.find(params[:id])
    authorize membership
    new_role = params[:role].to_s
    unless Membership.roles.key?(new_role)
      return render json: { error: "Invalid role." }, status: :unprocessable_entity
    end

    actor_is_owner = Current.user.role_for(Current.account) == "owner"

    if new_role == "owner"
      unless actor_is_owner
        return render json: { error: "Only owners can promote to owner." }, status: :forbidden
      end
      # Small-workspace guard: ownership stays deliberately scarce so the
      # "always keep an owner" invariant is easy to reason about.
      if membership.role != "owner" && owner_count >= owner_limit
        return render json: { error: "This workspace allows at most #{owner_limit} owners." },
                      status: :unprocessable_entity
      end
    end

    # The admin tier is the owner's to give and take away.
    if !actor_is_owner && (new_role == "admin" || membership.role == "admin")
      return render json: { error: "Only owners can manage the admin role." }, status: :forbidden
    end

    membership.update!(role: new_role)
    render json: membership
  end

  def destroy
    membership = Membership.find(params[:id])
    authorize membership
    # Removing yourself would leave you signed in with no membership, so
    # hand ownership over (or ask someone else) instead.
    if membership.user_id == Current.user.id
      return render json: { error: "You cannot remove yourself from the workspace." },
                    status: :unprocessable_entity
    end
    membership.destroy!
    head :no_content
  end

  private

  def owner_count
    @owner_count ||= Current.account.memberships.where(role: :owner).count
  end

  def owner_limit
    Integer(ENV.fetch("OWNER_LIMIT", "2"))
  end
end
