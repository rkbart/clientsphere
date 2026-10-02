class PasswordReset < ApplicationRecord
  belongs_to :user

  # Raw token is transient: only the digest is stored, mirroring Invitation.
  attr_accessor :token

  validates :token_digest, presence: true

  before_validation :generate_token_digest, on: :create
  before_validation :set_default_expiry, on: :create

  scope :usable, -> { where(used_at: nil).where("expires_at > ?", Time.current) }

  def expired?
    expires_at <= Time.current
  end

  def usable?
    used_at.nil? && !expired?
  end

  private

  def generate_token_digest
    self.token = SecureRandom.urlsafe_base64(32)
    self.token_digest = Digest::SHA256.hexdigest(token)
  end

  def set_default_expiry
    self.expires_at ||= 2.hours.from_now
  end
end
