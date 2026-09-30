class CreateApiTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :api_tokens, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.string :prefix, null: false
      t.string :token_digest, null: false
      t.datetime :last_used_at
      t.datetime :expires_at
      t.timestamps
    end
    add_index :api_tokens, :token_digest, unique: true
    add_index :api_tokens, [:account_id, :name], unique: true
  end
end
