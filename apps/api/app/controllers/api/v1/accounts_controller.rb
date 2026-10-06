class Api::V1::AccountsController < Api::V1::BaseController
  # Every signed-in user may create workspaces (unlimited); they become the
  # owner of each one they create. Joining someone else's workspace remains
  # invite-only — there is no self-serve join.
  def index
    # policy_scope satisfies verify_policy_scoped; AccountPolicy::Scope is
    # the caller's own workspaces (oldest first).
    render json: policy_scope(Account).order(:created_at)
          .as_json(only: [:id, :name, :slug, :created_at])
  end

  def create
    authorize Account.new, :create?
    account = nil
    ApplicationRecord.transaction do
      account = Account.create!(name: account_params[:name].to_s.strip)
      Membership.create!(user: Current.user, account: account, role: :owner)
      Current.user.update!(current_account: account)
    end
    render json: account, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def update
    account = Current.user.accounts.find(params[:id])
    authorize account, :update?
    account.name = params[:name].to_s.strip if params.key?(:name)
    if account.save
      render json: account
    else
      render json: { error: account.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Owner-only danger zone. Cascades to every record under the workspace
  # (contacts, deals, pipelines, ... via dependent: :destroy). Members left
  # behind get the same treatment as Team-removal: sessions/tokens revoked,
  # pinned workspace repointed, password login refused with no memberships.
  # The last remaining workspace cannot be deleted — a signed-in user must
  # always have a tenant.
  def destroy
    account = Current.user.accounts.find(params[:id])
    authorize account, :destroy?
    if Current.user.role_for(account) != "owner"
      return render json: { error: "Only owners can delete the workspace." }, status: :forbidden
    end
    if Current.user.accounts.one?
      return render json: { error: "You cannot delete your last workspace." },
                    status: :unprocessable_entity
    end

    survivors = Current.user.accounts.where.not(id: account.id)
    ApplicationRecord.transaction do
      account.memberships.includes(:user).find_each do |membership|
        member = membership.user
        next if member == Current.user

        member.sessions.destroy_all
        member.api_tokens.destroy_all
        member.password_resets.usable.update_all(used_at: Time.current)
      end
      # The last-owner guard protects a *live* workspace — meaningless here
      # because the workspace itself dies next. delete_all skips callbacks
      # (the guard would abort the cascade).
      account.memberships.delete_all
      # users.current_account_id has an FK to accounts: everyone pinned here
      # must be repointed before the DELETE or Postgres rejects it.
      User.where(current_account_id: account.id).find_each do |u|
        fallback = u == Current.user ? survivors.order(:created_at).first : u.accounts.order(:created_at).first
        u.update!(current_account: fallback)
      end
      account.destroy!
      Current.user.reload
      Current.user.update!(current_account: survivors.order(:created_at).first) if Current.user.current_account_id.nil?
    end
    render json: { account: Current.user.current_account }, status: :ok
  end

  private

  def account_params
    params.require(:account).permit(:name)
  end
end
