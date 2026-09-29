# Phase 2: metadata-only AI call log (no prompt/completion content) and the
# optional PII redaction toggle from the plan's privacy controls.
class AddAiLogsAndRedactPii < ActiveRecord::Migration[8.1]
  def change
    create_table :ai_logs, id: :uuid do |t|
      t.uuid :account_id, null: false
      t.string :action, null: false
      t.string :provider
      t.string :model
      t.boolean :success, null: false, default: true
      t.string :error
      t.integer :duration_ms
      t.timestamps
    end

    add_index :ai_logs, :account_id
    add_index :ai_logs, %i[account_id action]

    add_column :ai_settings, :redact_pii, :boolean, default: false, null: false
  end
end
