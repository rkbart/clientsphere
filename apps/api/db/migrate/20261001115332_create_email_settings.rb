class CreateEmailSettings < ActiveRecord::Migration[8.1]
  def change
    create_table :email_settings, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :account_id, null: false
      t.text :resend_api_key
      t.string :from_address
      t.text :webhook_secret
      t.timestamps

      t.index :account_id, unique: true, name: "index_email_settings_on_account_id"
    end

    add_column :emails, :provider_message_id, :string
    add_index :emails, :provider_message_id, unique: true, name: "index_emails_on_provider_message_id"
  end
end
