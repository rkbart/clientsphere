class Membership < ApplicationRecord
  belongs_to :account
  belongs_to :user

  enum :role, { owner: 0, admin: 1, member: 2, viewer: 3 }

  validates :role, presence: true
  validates :user_id, uniqueness: { scope: :account_id }

  # An account must always keep at least one owner.
  before_update :ensure_owner_remains, if: -> { role_changed? && role_was == "owner" }
  before_destroy :ensure_owner_remains, if: :owner?

  private

  def ensure_owner_remains
    return if account.memberships.where(role: :owner).where.not(id: id).exists?

    errors.add(:base, "account must keep at least one owner")
    throw :abort
  end
end
