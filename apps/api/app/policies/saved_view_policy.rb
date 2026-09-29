class SavedViewPolicy < ApplicationPolicy
  def index?
    viewer_or_above?
  end

  def show?
    viewer_or_above?
  end

  def create?
    member_or_above?
  end

  def update?
    member_or_above?
  end

  def destroy?
    owner_or_admin?
  end

  class Scope < Scope
    def resolve
      if user.role_for(account) == "viewer"
        super.where(shared: true).or(super.where(user: user))
      else
        super
      end
    end
  end
end
