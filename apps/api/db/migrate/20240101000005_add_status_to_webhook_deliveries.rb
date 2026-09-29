class AddStatusToWebhookDeliveries < ActiveRecord::Migration[8.1]
  def change
    add_column :webhook_deliveries, :status, :integer, default: 0, null: false
  end
end
