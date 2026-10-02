class UserPolicy < ApplicationPolicy
  # Self-service endpoint: callers may only act on themselves.
  def me?
    true
  end
end
