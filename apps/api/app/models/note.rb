class Note < ApplicationRecord
  include PaperTrail::Model

  belongs_to :account
  belongs_to :author, class_name: "User"
  belongs_to :notable, polymorphic: true

  validates :body, presence: true
end
