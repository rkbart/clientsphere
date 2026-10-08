class AutomationJob < ApplicationJob
  queue_as :default

  ALLOWED_RECORD_TYPES = %w[Contact Company Deal Activity Email].freeze

  def perform(automation_id, event_type, record_type, record_id)
    return unless ALLOWED_RECORD_TYPES.include?(record_type)

    automation = Automation.find(automation_id)
    record = record_type.constantize.find(record_id)
    return unless record.account_id == automation.account_id

    Automations::Engine.new(automation).trigger(event_type, record)
  end
end
