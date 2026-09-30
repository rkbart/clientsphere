class Invitation < ApplicationRecord
  belongs_to :account
  belongs_to :invited_by, class_name: "User"

  enum :role, { admin: 1, member: 2, viewer: 3 }

  # Raw token is transient: only the digest is stored. The controller
  # exposes it once in the create response so callers can build the link.
  attr_accessor :token

  validates :email, presence: true, uniqueness: { scope: :account_id }
  validates :token_digest, presence: true

  before_validation :generate_token_digest, on: :create
  before_validation :set_default_expiry, on: :create

  def accept!(user)
    transaction do
      Membership.create!(account: account, user: user, role: role)
      update!(accepted_at: Time.current)
    end
  end

  def expired?
    expires_at < Time.current
  end

  private

  def generate_token_digest
    self.token = SecureRandom.urlsafe_base64(32)
    self.token_digest = Digest::SHA256.hexdigest(token)
  end

  def set_default_expiry
    self.expires_at ||= 7.days.from_now
  end
end
