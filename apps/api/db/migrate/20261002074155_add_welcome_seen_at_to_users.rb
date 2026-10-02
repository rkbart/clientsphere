class AddWelcomeSeenAtToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :welcome_seen_at, :datetime
  end
end
