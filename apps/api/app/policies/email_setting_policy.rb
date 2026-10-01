class EmailSettingPolicy < ApplicationPolicy
  def show?
    owner_or_admin?
  end

  def update?
    owner_or_admin?
  end
end
