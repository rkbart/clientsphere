class AddOverdueFiredAtToActivities < ActiveRecord::Migration[8.1]
  def change
    add_column :activities, :overdue_fired_at, :datetime
  end
end
