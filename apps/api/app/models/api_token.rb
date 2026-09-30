class ApiToken < ApplicationRecord
  belongs_to :account
  belongs_to :user

  # Raw token is transient: only the digest is stored. The controller
  # exposes it once in the create response.
  attr_accessor :token

  validates :name, presence: true, uniqueness: { scope: :account_id }
  validates :token_digest, presence: true

  before_validation :generate_token, on: :create

  def self.authenticate(raw_token)
    return nil unless raw_token.is_a?(String) && raw_token.start_with?("csk_")

    token = find_by(token_digest: Digest::SHA256.hexdigest(raw_token))
    return nil if token.nil? || token.expired?

    token
  end

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def record_usage!
    update_column(:last_used_at, Time.current)
  end

  private

  def generate_token
    self.token = "csk_#{SecureRandom.urlsafe_base64(32)}"
    self.token_digest = Digest::SHA256.hexdigest(token)
    self.prefix = token.first(12)
  end
end
