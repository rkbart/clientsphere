class Pipeline < ApplicationRecord
  belongs_to :account
  has_many :stages, dependent: :destroy
  has_many :deals, through: :stages

  validates :name, presence: true

  after_create :create_default_stages

  private

  def create_default_stages
    stages.create!([
      { name: "New", position: 0, color: "#3B82F6", probability: 10, kind: :open, account_id: account.id },
      { name: "Contacted", position: 1, color: "#8B5CF6", probability: 25, kind: :open, account_id: account.id },
      { name: "Proposal", position: 2, color: "#F59E0B", probability: 50, kind: :open, account_id: account.id },
      { name: "Negotiation", position: 3, color: "#F97316", probability: 75, kind: :open, account_id: account.id },
      { name: "Won", position: 4, color: "#10B981", probability: 100, kind: :won, account_id: account.id },
      { name: "Lost", position: 5, color: "#EF4444", probability: 0, kind: :lost, account_id: account.id }
    ])
  end
end
