class AiMessage < ApplicationRecord
  belongs_to :conversation, class_name: "AiConversation"

  enum :role, { user: 0, assistant: 1, system: 2 }

  validates :content, presence: true
  validates :role, presence: true
end
