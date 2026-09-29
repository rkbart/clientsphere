class AutomationJob < ApplicationJob
  queue_as :default

  def perform(automation_id, event_type, record_type, record_id)
    automation = Automation.find(automation_id)
    record = record_type.constantize.find(record_id)

    Automations::Engine.new(automation).trigger(event_type, record)
  end
end
