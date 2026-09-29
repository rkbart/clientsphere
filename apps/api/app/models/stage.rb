class Stage < ApplicationRecord
  belongs_to :account
  belongs_to :pipeline
  has_many :deals, dependent: :destroy

  enum :kind, { open: 0, won: 1, lost: 2 }

  validates :name, presence: true
  validates :position, presence: true

  default_scope { order(:position) }

  before_validation :inherit_account, on: :create

  private

  def inherit_account
    self.account ||= pipeline&.account
  end
end
