class TagPolicy < ApplicationPolicy
  def index?
    viewer_or_above?
  end

  def create?
    member_or_above?
  end

  def destroy?
    member_or_above?
  end
end
