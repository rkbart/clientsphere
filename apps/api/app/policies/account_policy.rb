class AccountPolicy < ApplicationPolicy
  # Any signed-in member may create workspaces (unlimited); they become the
  # owner. Joining someone else's stays invite-only.
  def create?
    true
  end

  # Any member may rename; deletion is owner-only (plus the controller's
  # last-workspace guard).
  def update?
    true
  end

  def destroy?
    user.role_for(record) == "owner"
  end

  class Scope < Scope
    def resolve
      # Scope base class exposes @user, not a reader.
      @user.accounts.order(:created_at)
    end
  end
end
