class AiLog < ApplicationRecord
  belongs_to :account

  validates :action, presence: true
end
