class RemoveGmailConnectFromUsersAndSettings < ActiveRecord::Migration[8.1]
  def change
    remove_reference :email_settings, :gmail_user, type: :uuid, foreign_key: { to_table: :users }, if_exists: true
    remove_column :users, :google_refresh_token, :text, if_exists: true
    remove_column :users, :google_email, :string, if_exists: true
  end
end
