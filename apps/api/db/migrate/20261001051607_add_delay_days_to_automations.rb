class AddDelayDaysToAutomations < ActiveRecord::Migration[8.1]
  def change
    add_column :automations, :delay_days, :integer, default: 0, null: false
  end
end
