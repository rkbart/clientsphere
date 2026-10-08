class AddMessageIdToEmails < ActiveRecord::Migration[8.1]
  def change
    add_column :emails, :message_id, :string
  end
end
