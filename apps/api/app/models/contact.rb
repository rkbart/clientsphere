class Contact < ApplicationRecord
  include Discard::Model
  include PaperTrail::Model

  enum :status, { lead: 0, customer: 1, churned: 2 }, default: :lead

  belongs_to :account
  belongs_to :company, optional: true
  belongs_to :owner, class_name: "User", optional: true
  has_many :deals, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :notes, as: :notable, dependent: :destroy
  has_many :emails, dependent: :destroy
  has_many :taggings, as: :taggable, dependent: :destroy
  has_many :tags, through: :taggings

  validates :first_name, presence: true
  validates :email, uniqueness: { scope: :account_id }, allow_blank: true

  after_create_commit { Automations::Trigger.call(account, :contact_created, self) }
  after_update_commit { Automations::Trigger.call(account, :contact_updated, self) }

  scope :search, ->(query) { where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?", "%#{query}%", "%#{query}%", "%#{query}%") }

  def full_name
    [first_name, last_name].compact.join(" ")
  end

  def score!
    Leads::Scorer.new(self).call
  end
end
