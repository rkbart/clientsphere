class SequenceEnrollmentPolicy < ApplicationPolicy
  def index?
    viewer_or_above?
  end

  def unsubscribe?
    member_or_above?
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
