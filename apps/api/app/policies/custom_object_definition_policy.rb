class CustomObjectDefinitionPolicy < ApplicationPolicy
  def index?
    viewer_or_above?
  end

  def show?
    viewer_or_above?
  end

  def create?
    owner_or_admin?
  end

  def update?
    owner_or_admin?
  end

  def destroy?
    owner_or_admin?
  end

  class Scope < Scope
    def resolve
      super
    end
  end
end
