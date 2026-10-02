class DropSavedViews < ActiveRecord::Migration[8.1]
  def up
    drop_table :saved_views
  end

  def down
    create_table :saved_views, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :account_id, null: false
      t.uuid :user_id, null: false
      t.string :entity_type, null: false
      t.string :name, null: false
      t.jsonb :filters, default: {}
      t.jsonb :sort, default: {}
      t.jsonb :columns, default: {}
      t.boolean :shared, default: false
      t.timestamps
    end
  end
end
