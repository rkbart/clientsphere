class Account < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :contacts, dependent: :destroy
  has_many :companies, dependent: :destroy
  has_many :deals, dependent: :destroy
  has_many :pipelines, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :notes, dependent: :destroy
  has_many :emails, dependent: :destroy
  has_many :tags, dependent: :destroy
  has_many :custom_field_definitions, dependent: :destroy
  has_many :custom_object_definitions, dependent: :destroy
  has_many :custom_object_records, dependent: :destroy
  has_many :plugins, dependent: :destroy
  has_many :saved_views, dependent: :destroy
  has_many :automations, dependent: :destroy
  has_many :automation_runs, dependent: :destroy
  has_many :email_sequences, dependent: :destroy
  has_many :sequence_enrollments, dependent: :destroy
  has_many :webhooks, dependent: :destroy
  has_many :api_tokens, dependent: :destroy
  has_one :ai_setting, dependent: :destroy

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, on: :create

  private

  def generate_slug
    self.slug = name.parameterize if slug.blank?
  end
end
