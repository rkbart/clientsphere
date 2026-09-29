class User < ApplicationRecord
  has_secure_password

  belongs_to :current_account, class_name: "Account", optional: true
  has_many :memberships, dependent: :destroy
  has_many :accounts, through: :memberships
  has_many :created_contacts, class_name: "Contact", foreign_key: :owner_id
  has_many :assigned_activities, class_name: "Activity", foreign_key: :assignee_id
  has_many :authored_notes, class_name: "Note", foreign_key: :author_id
  has_many :ai_conversations, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  def role_for(account)
    memberships.find_by(account: account)&.role
  end

  def switch_account!(account)
    raise "Not a member" unless accounts.include?(account)
    update!(current_account: account)
  end
end
