class Pipeline < ApplicationRecord
  belongs_to :account
  has_many :stages, dependent: :destroy
  has_many :deals, through: :stages

  validates :name, presence: true

  after_create :create_default_stages

  private

  def create_default_stages
    stages.create!([
      { name: "New", position: 0, color: "#3B82F6", probability: 10, kind: :open },
      { name: "Contacted", position: 1, color: "#8B5CF6", probability: 25, kind: :open },
      { name: "Proposal", position: 2, color: "#F59E0B", probability: 50, kind: :open },
      { name: "Negotiation", position: 3, color: "#F97316", probability: 75, kind: :open },
      { name: "Won", position: 4, color: "#10B981", probability: 100, kind: :won },
      { name: "Lost", position: 5, color: "#EF4444", probability: 0, kind: :lost }
    ])
  end
end
