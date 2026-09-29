class InvitationPolicy < ApplicationPolicy
  def create?
    owner_or_admin?
  end
end
