class PluginWebhookJob < ApplicationJob
  queue_as :default

  def perform(plugin_id, event_type, record_type, record_id)
    plugin = Plugin.find(plugin_id)
    record = record_type.constantize.find(record_id)
    return unless record.account_id == plugin.account_id

    payload = {
      event: event_type,
      plugin: plugin.name,
      data: record.as_json,
      timestamp: Time.current.iso8601
    }.to_json

    HTTP.timeout(10)
        .headers("Content-Type" => "application/json")
        .post(plugin.webhook_url, body: payload)
  rescue StandardError => e
    Rails.logger.warn("[PluginWebhookJob] delivery failed for plugin #{plugin_id}: #{e.message}")
  end
end
