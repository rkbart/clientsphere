# Contact.status became a real enum (lead/customer/churned); seeded rows were
# written as NULL because the integer column cast `:lead` to nil. Backfill them.
class BackfillContactStatus < ActiveRecord::Migration[8.1]
  def up
    execute "UPDATE contacts SET status = 0 WHERE status IS NULL"
  end

  def down
    # no-op: backfilled values remain valid enum values
  end
end
