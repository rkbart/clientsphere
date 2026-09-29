class Stage < ApplicationRecord
  belongs_to :pipeline
  has_many :deals, dependent: :destroy

  enum :kind, { open: 0, won: 1, lost: 2 }

  validates :name, presence: true
  validates :position, presence: true

  default_scope { order(:position) }
end
