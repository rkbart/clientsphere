class CreateCustomObjects < ActiveRecord::Migration[8.1]
  def change
    create_table :custom_object_definitions, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.string :icon, default: "📦"
      t.jsonb :fields, default: []
      t.timestamps
    end
    add_index :custom_object_definitions, [:account_id, :name], unique: true

    create_table :custom_object_records, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :custom_object_definition, type: :uuid, null: false, foreign_key: true
      t.jsonb :data, default: {}
      t.timestamps
    end
    add_index :custom_object_records, [:account_id, :custom_object_definition_id]
  end
end
