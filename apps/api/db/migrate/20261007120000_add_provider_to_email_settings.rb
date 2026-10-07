class AddProviderToEmailSettings < ActiveRecord::Migration[8.1]
  def change
    add_column :email_settings, :provider, :string, null: false, default: "resend"
    add_column :email_settings, :smtp_password, :text
  end
end
