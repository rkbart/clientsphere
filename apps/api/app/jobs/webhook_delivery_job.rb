class WebhookDeliveryJob < ApplicationJob
  queue_as :default

  def perform(delivery_id)
    delivery = WebhookDelivery.find(delivery_id)
    webhook = delivery.webhook

    Webhooks::Deliverer.new(webhook).deliver(
      event: delivery.event,
      data: delivery.payload
    )
  end
end
