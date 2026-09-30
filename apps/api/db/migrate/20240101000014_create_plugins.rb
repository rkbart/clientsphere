class CreatePlugins < ActiveRecord::Migration[8.1]
  def change
    create_table :plugins, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.string :description
      t.jsonb :triggers, default: []
      t.string :webhook_url
      t.boolean :is_active, default: true
      t.timestamps
    end
    add_index :plugins, [:account_id, :name], unique: true
  end
end
