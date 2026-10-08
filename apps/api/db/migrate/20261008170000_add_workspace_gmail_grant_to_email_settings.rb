class AddWorkspaceGmailGrantToEmailSettings < ActiveRecord::Migration[8.1]
  def change
    add_column :email_settings, :gmail_refresh_token, :text
    add_column :email_settings, :gmail_address, :string
    add_column :email_settings, :gmail_grant_revoked, :boolean, default: false, null: false
  end
end
