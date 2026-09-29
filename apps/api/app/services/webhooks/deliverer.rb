module Webhooks
  class Deliverer
    def initialize(webhook)
      @webhook = webhook
    end

    def deliver(event:, data:)
      return unless @webhook.is_active
      return if @webhook.events.present? && !@webhook.events.include?(event.to_s)

      payload = {
        event: event,
        data: data,
        timestamp: Time.current.iso8601
      }.to_json

      signature = @webhook.sign(payload)

      delivery = @webhook.deliveries.create!(
        account_id: @webhook.account_id,
        event: event,
        payload: JSON.parse(payload),
        status: :pending
      )

      response = HTTP.timeout(10)
                     .headers(
                       "Content-Type" => "application/json",
                       "X-Webhook-Signature" => signature
                     )
                     .post(@webhook.url, body: payload)

      delivery.update!(
        status: response.status.success? ? :success : :failed,
        response_status: response.status,
        delivered_at: Time.current
      )
    rescue HTTP::Error, HTTP::TimeoutError
      delivery.update!(
        status: :failed,
        response_status: 0,
        attempts: delivery.attempts + 1
      )

      if delivery.attempts < 3
        WebhookDeliveryJob.set(wait: (2**delivery.attempts).minutes).perform_later(delivery.id)
      end
    end
  end
end
