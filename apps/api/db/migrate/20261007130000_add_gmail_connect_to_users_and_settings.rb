class AddGmailConnectToUsersAndSettings < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :google_refresh_token, :text
    add_column :users, :google_email, :string
    add_reference :email_settings, :gmail_user, type: :uuid, foreign_key: { to_table: :users }
  end
end
