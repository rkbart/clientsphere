class Session < ApplicationRecord
  belongs_to :user

  before_create :generate_token

  def self.authenticate(token)
    find_by(token_digest: Digest::SHA256.hexdigest(token))
  end

  private

  def generate_token
    self.token = SecureRandom.urlsafe_base64(32)
    self.token_digest = Digest::SHA256.hexdigest(token)
  end
end
