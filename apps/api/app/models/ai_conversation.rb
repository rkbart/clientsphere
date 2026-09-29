class AiConversation < ApplicationRecord
  belongs_to :account
  belongs_to :user
  has_many :messages, class_name: "AiMessage", dependent: :destroy

  validates :title, presence: true
end
