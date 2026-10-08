class AddInboundEmailSupport < ActiveRecord::Migration[8.1]
  def change
    add_column :emails, :read_at, :datetime
    add_column :emails, :in_reply_to, :string
    add_column :emails, :thread_key, :string
    add_index :emails, :thread_key

    add_column :email_settings, :inbound_address, :string
    add_index :email_settings, :inbound_address, unique: true
  end
end
