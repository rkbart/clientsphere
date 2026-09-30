class Plugin < ApplicationRecord
  belongs_to :account

  validates :name, presence: true, uniqueness: { scope: :account_id }
  validates :webhook_url, presence: true, if: :is_active?

  after_create_commit :dispatch_pending_events

  private

  def dispatch_pending_events
    # Plugins are triggered by the same event system as automations.
    # This callback is a no-op for now; the actual dispatch happens
    # in Automations::Trigger which also fires plugin webhooks.
  end
end
