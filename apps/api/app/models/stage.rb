class Stage < ApplicationRecord
  belongs_to :account
  belongs_to :pipeline
  has_many :deals, dependent: :destroy

  enum :kind, { open: 0, won: 1, lost: 2 }

  validates :name, presence: true
  validates :position, presence: true

  default_scope { order(:position) }

  before_validation :inherit_account, on: :create
  before_destroy :ensure_no_deals, prepend: true

  private

  def ensure_no_deals
    if deals.exists?
      errors.add(:base, "cannot delete a stage with deals — move them first")
      throw :abort
    end
  end

  def inherit_account
    self.account ||= pipeline&.account
  end
end
