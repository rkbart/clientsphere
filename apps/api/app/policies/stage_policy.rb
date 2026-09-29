class StagePolicy < ApplicationPolicy
  def create?
    owner_or_admin?
  end

  def update?
    owner_or_admin?
  end

  def destroy?
    owner_or_admin?
  end
end
