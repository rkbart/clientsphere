class RemoveAiTables < ActiveRecord::Migration[8.1]
  def up
    remove_foreign_key :ai_messages, :ai_conversations, column: :conversation_id
    remove_foreign_key :ai_messages, :accounts
    remove_foreign_key :ai_conversations, :accounts
    remove_foreign_key :ai_conversations, :users
    remove_foreign_key :ai_settings, :accounts
    drop_table :ai_messages
    drop_table :ai_conversations
    drop_table :ai_logs
    drop_table :ai_settings
  end

  def down
    create_table :ai_conversations, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :account_id, null: false
      t.uuid :user_id, null: false
      t.string :title, null: false
      t.timestamps
      t.index :account_id
      t.index :user_id
    end

    create_table :ai_logs, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :account_id, null: false
      t.string :action, null: false
      t.string :provider
      t.string :model
      t.boolean :success, default: true, null: false
      t.string :error
      t.integer :duration_ms
      t.timestamps
      t.index %i[account_id action]
      t.index :account_id
    end

    create_table :ai_messages, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :account_id, null: false
      t.uuid :conversation_id, null: false
      t.integer :role, null: false
      t.text :content, null: false
      t.timestamps
      t.index :account_id
      t.index :conversation_id
    end

    create_table :ai_settings, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :account_id, null: false
      t.string :provider, null: false
      t.string :model, null: false
      t.string :base_url
      t.text :api_key
      t.boolean :enabled, default: false
      t.timestamps
      t.boolean :redact_pii, default: false, null: false
      t.index :account_id
    end

    add_foreign_key :ai_conversations, :accounts
    add_foreign_key :ai_conversations, :users
    add_foreign_key :ai_messages, :accounts
    add_foreign_key :ai_messages, :ai_conversations, column: :conversation_id
    add_foreign_key :ai_settings, :accounts
  end
end
