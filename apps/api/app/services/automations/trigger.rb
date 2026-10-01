module Automations
  # Enqueues AutomationJob for every active automation matching the event.
  # Called from model callbacks (after_*_commit) so jobs only fire for
  # persisted changes. Also dispatches plugin webhooks.
  module Trigger
    def self.call(account, event_type, record)
      return unless record.respond_to?(:account_id) && record.account_id == account.id

      account.automations.where(trigger_type: event_type, is_active: true).find_each do |automation|
        args = [automation.id, event_type.to_s, record.class.name, record.id]
        if automation.delay_days.to_i.positive?
          AutomationJob.set(wait_until: automation.delay_days.days.from_now).perform_later(*args)
        else
          AutomationJob.perform_later(*args)
        end
      end

      account.plugins.where(is_active: true).find_each do |plugin|
        next unless plugin.triggers.include?(event_type.to_s)
        next if plugin.webhook_url.blank?

        PluginWebhookJob.perform_later(plugin.id, event_type.to_s, record.class.name, record.id)
      end
    end
  end
end
