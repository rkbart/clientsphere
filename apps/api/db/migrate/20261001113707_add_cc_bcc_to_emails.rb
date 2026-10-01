class AddCcBccToEmails < ActiveRecord::Migration[8.1]
  def change
    add_column :emails, :cc_addresses, :jsonb, default: [], null: false
    add_column :emails, :bcc_addresses, :jsonb, default: [], null: false
  end
end
