class InvitationPolicy < ApplicationPolicy
  def index?
    owner_or_admin?
  end

  def create?
    owner_or_admin?
  end

  def destroy?
    owner_or_admin?
  end
end
