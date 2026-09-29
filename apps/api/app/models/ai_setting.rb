class AiSetting < ApplicationRecord
  belongs_to :account

  encrypts :api_key

  validates :provider, presence: true
  validates :model, presence: true

  def test_connection!
    Ai::Client.new(self).test_connection
  end
end
