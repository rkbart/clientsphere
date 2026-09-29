# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2024_01_01_000004) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "accounts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.jsonb "settings", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_accounts_on_slug", unique: true
  end

  create_table "activities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.integer "kind", default: 4, null: false
    t.string "subject", null: false
    t.text "description"
    t.uuid "contact_id"
    t.uuid "company_id"
    t.uuid "deal_id"
    t.uuid "creator_id", null: false
    t.uuid "assignee_id"
    t.datetime "due_at"
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_activities_on_account_id"
    t.index ["assignee_id"], name: "index_activities_on_assignee_id"
    t.index ["company_id"], name: "index_activities_on_company_id"
    t.index ["contact_id"], name: "index_activities_on_contact_id"
    t.index ["creator_id"], name: "index_activities_on_creator_id"
    t.index ["deal_id"], name: "index_activities_on_deal_id"
  end

  create_table "ai_conversations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "user_id", null: false
    t.string "title", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_ai_conversations_on_account_id"
    t.index ["user_id"], name: "index_ai_conversations_on_user_id"
  end

  create_table "ai_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "action", null: false
    t.string "provider"
    t.string "model"
    t.boolean "success", default: true, null: false
    t.string "error"
    t.integer "duration_ms"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "action"], name: "index_ai_logs_on_account_id_and_action"
    t.index ["account_id"], name: "index_ai_logs_on_account_id"
  end

  create_table "ai_messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "conversation_id", null: false
    t.integer "role", null: false
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.index ["account_id"], name: "index_ai_messages_on_account_id"
    t.index ["conversation_id"], name: "index_ai_messages_on_conversation_id"
  end

  create_table "ai_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "provider", null: false
    t.string "model", null: false
    t.string "base_url"
    t.text "api_key"
    t.boolean "enabled", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "redact_pii", default: false, null: false
    t.index ["account_id"], name: "index_ai_settings_on_account_id"
  end

  create_table "automation_runs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "automation_id", null: false
    t.integer "status", default: 0
    t.jsonb "trigger_data", default: {}
    t.jsonb "result", default: {}
    t.datetime "ran_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_automation_runs_on_account_id"
    t.index ["automation_id"], name: "index_automation_runs_on_automation_id"
  end

  create_table "automations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "name", null: false
    t.integer "trigger_type", null: false
    t.jsonb "trigger_config", default: {}
    t.jsonb "conditions", default: {}
    t.jsonb "actions", default: {}
    t.boolean "is_active", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_automations_on_account_id"
  end

  create_table "companies", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "name", null: false
    t.string "domain"
    t.string "industry"
    t.string "size_range"
    t.decimal "annual_revenue", precision: 14, scale: 2
    t.text "description"
    t.uuid "owner_id"
    t.jsonb "custom_data", default: {}
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_companies_on_account_id"
    t.index ["owner_id"], name: "index_companies_on_owner_id"
  end

  create_table "contacts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "first_name", null: false
    t.string "last_name"
    t.string "email"
    t.string "phone"
    t.uuid "company_id"
    t.uuid "owner_id"
    t.integer "status", default: 0
    t.string "source"
    t.integer "lead_score", default: 0
    t.jsonb "score_reasons", default: []
    t.jsonb "custom_data", default: {}
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "email"], name: "index_contacts_on_account_and_email_unique", unique: true, where: "((email IS NOT NULL) AND (discarded_at IS NULL))"
    t.index ["account_id"], name: "index_contacts_on_account_id"
    t.index ["company_id"], name: "index_contacts_on_company_id"
    t.index ["owner_id"], name: "index_contacts_on_owner_id"
  end

  create_table "custom_field_definitions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "entity_type", null: false
    t.string "key", null: false
    t.string "label", null: false
    t.integer "field_type", default: 0, null: false
    t.jsonb "options", default: {}
    t.boolean "required", default: false
    t.integer "position", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "entity_type", "key"], name: "idx_on_account_id_entity_type_key_802e61c317", unique: true
    t.index ["account_id"], name: "index_custom_field_definitions_on_account_id"
  end

  create_table "deals", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "title", null: false
    t.decimal "amount", precision: 12, scale: 2
    t.string "currency", default: "USD"
    t.uuid "pipeline_id", null: false
    t.uuid "stage_id", null: false
    t.uuid "contact_id"
    t.uuid "company_id"
    t.uuid "owner_id"
    t.date "expected_close_date"
    t.integer "probability", default: 0
    t.integer "position", default: 0
    t.datetime "closed_at"
    t.jsonb "custom_data", default: {}
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_deals_on_account_id"
    t.index ["company_id"], name: "index_deals_on_company_id"
    t.index ["contact_id"], name: "index_deals_on_contact_id"
    t.index ["owner_id"], name: "index_deals_on_owner_id"
    t.index ["pipeline_id"], name: "index_deals_on_pipeline_id"
    t.index ["stage_id"], name: "index_deals_on_stage_id"
  end

  create_table "email_sequence_steps", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "sequence_id", null: false
    t.integer "step_order", null: false
    t.integer "delay_days", default: 0, null: false
    t.string "subject", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_email_sequence_steps_on_account_id"
    t.index ["sequence_id"], name: "index_email_sequence_steps_on_sequence_id"
  end

  create_table "email_sequences", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "name", null: false
    t.boolean "is_active", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_email_sequences_on_account_id"
  end

  create_table "emails", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.integer "direction", null: false
    t.string "from_address"
    t.jsonb "to_addresses", default: []
    t.string "subject", null: false
    t.text "body"
    t.uuid "contact_id"
    t.uuid "deal_id"
    t.integer "status", default: 0
    t.datetime "sent_at"
    t.datetime "opened_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_emails_on_account_id"
    t.index ["contact_id"], name: "index_emails_on_contact_id"
    t.index ["deal_id"], name: "index_emails_on_deal_id"
  end

  create_table "invitations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "email", null: false
    t.integer "role", default: 2, null: false
    t.string "token_digest", null: false
    t.uuid "invited_by_id", null: false
    t.datetime "expires_at", null: false
    t.datetime "accepted_at"
    t.datetime "created_at", null: false
    t.index ["account_id"], name: "index_invitations_on_account_id"
    t.index ["invited_by_id"], name: "index_invitations_on_invited_by_id"
  end

  create_table "memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "user_id", null: false
    t.integer "role", default: 2, null: false
    t.datetime "created_at", null: false
    t.index ["account_id", "user_id"], name: "index_memberships_on_account_id_and_user_id", unique: true
    t.index ["account_id"], name: "index_memberships_on_account_id"
    t.index ["user_id"], name: "index_memberships_on_user_id"
  end

  create_table "notes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.text "body", null: false
    t.string "notable_type", null: false
    t.uuid "notable_id", null: false
    t.uuid "author_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_notes_on_account_id"
    t.index ["author_id"], name: "index_notes_on_author_id"
    t.index ["notable_type", "notable_id"], name: "index_notes_on_notable_type_and_notable_id"
  end

  create_table "pipelines", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "name", null: false
    t.boolean "is_default", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_pipelines_on_account_id"
  end

  create_table "saved_views", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "user_id", null: false
    t.string "entity_type", null: false
    t.string "name", null: false
    t.jsonb "filters", default: {}
    t.jsonb "sort", default: {}
    t.jsonb "columns", default: {}
    t.boolean "shared", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_saved_views_on_account_id"
    t.index ["user_id"], name: "index_saved_views_on_user_id"
  end

  create_table "sequence_enrollments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "sequence_id", null: false
    t.uuid "contact_id", null: false
    t.integer "current_step", default: 1, null: false
    t.integer "status", default: 0
    t.datetime "next_send_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_sequence_enrollments_on_account_id"
    t.index ["contact_id"], name: "index_sequence_enrollments_on_contact_id"
    t.index ["sequence_id"], name: "index_sequence_enrollments_on_sequence_id"
  end

  create_table "sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "ip_address"
    t.string "user_agent"
    t.string "token_digest", null: false
    t.datetime "created_at", null: false
    t.string "token"
    t.index ["token_digest"], name: "index_sessions_on_token_digest"
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "stages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "pipeline_id", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.string "color"
    t.integer "probability", default: 0
    t.integer "kind", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_stages_on_account_id"
    t.index ["pipeline_id"], name: "index_stages_on_pipeline_id"
  end

  create_table "taggings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "tag_id", null: false
    t.string "taggable_type", null: false
    t.uuid "taggable_id", null: false
    t.datetime "created_at", null: false
    t.index ["account_id"], name: "index_taggings_on_account_id"
    t.index ["tag_id", "taggable_type", "taggable_id"], name: "index_taggings_on_tag_id_and_taggable_type_and_taggable_id", unique: true
    t.index ["tag_id"], name: "index_taggings_on_tag_id"
  end

  create_table "tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "name", null: false
    t.string "color"
    t.datetime "created_at", null: false
    t.index ["account_id", "name"], name: "index_tags_on_account_id_and_name", unique: true
    t.index ["account_id"], name: "index_tags_on_account_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "name", null: false
    t.uuid "current_account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["current_account_id"], name: "index_users_on_current_account_id"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "versions", force: :cascade do |t|
    t.string "item_type", null: false
    t.bigint "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.jsonb "object"
    t.datetime "created_at"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  create_table "webhook_deliveries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "webhook_id", null: false
    t.string "event", null: false
    t.jsonb "payload", default: {}
    t.integer "response_status"
    t.integer "attempts", default: 0
    t.datetime "delivered_at"
    t.datetime "created_at", null: false
    t.index ["account_id"], name: "index_webhook_deliveries_on_account_id"
    t.index ["webhook_id"], name: "index_webhook_deliveries_on_webhook_id"
  end

  create_table "webhooks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "url", null: false
    t.jsonb "events", default: []
    t.text "secret", null: false
    t.boolean "is_active", default: true
    t.datetime "last_triggered_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_webhooks_on_account_id"
  end

  add_foreign_key "activities", "accounts"
  add_foreign_key "activities", "companies"
  add_foreign_key "activities", "contacts"
  add_foreign_key "activities", "deals"
  add_foreign_key "activities", "users", column: "assignee_id"
  add_foreign_key "activities", "users", column: "creator_id"
  add_foreign_key "ai_conversations", "accounts"
  add_foreign_key "ai_conversations", "users"
  add_foreign_key "ai_messages", "accounts"
  add_foreign_key "ai_messages", "ai_conversations", column: "conversation_id"
  add_foreign_key "ai_settings", "accounts"
  add_foreign_key "automation_runs", "accounts"
  add_foreign_key "automation_runs", "automations"
  add_foreign_key "automations", "accounts"
  add_foreign_key "companies", "accounts"
  add_foreign_key "companies", "users", column: "owner_id"
  add_foreign_key "contacts", "accounts"
  add_foreign_key "contacts", "companies"
  add_foreign_key "contacts", "users", column: "owner_id"
  add_foreign_key "custom_field_definitions", "accounts"
  add_foreign_key "deals", "accounts"
  add_foreign_key "deals", "companies"
  add_foreign_key "deals", "contacts"
  add_foreign_key "deals", "pipelines"
  add_foreign_key "deals", "stages"
  add_foreign_key "deals", "users", column: "owner_id"
  add_foreign_key "email_sequence_steps", "accounts"
  add_foreign_key "email_sequence_steps", "email_sequences", column: "sequence_id"
  add_foreign_key "email_sequences", "accounts"
  add_foreign_key "emails", "accounts"
  add_foreign_key "emails", "contacts"
  add_foreign_key "emails", "deals"
  add_foreign_key "invitations", "accounts"
  add_foreign_key "invitations", "users", column: "invited_by_id"
  add_foreign_key "memberships", "accounts"
  add_foreign_key "memberships", "users"
  add_foreign_key "notes", "accounts"
  add_foreign_key "notes", "users", column: "author_id"
  add_foreign_key "pipelines", "accounts"
  add_foreign_key "saved_views", "accounts"
  add_foreign_key "saved_views", "users"
  add_foreign_key "sequence_enrollments", "accounts"
  add_foreign_key "sequence_enrollments", "contacts"
  add_foreign_key "sequence_enrollments", "email_sequences", column: "sequence_id"
  add_foreign_key "sessions", "users"
  add_foreign_key "stages", "accounts"
  add_foreign_key "stages", "pipelines"
  add_foreign_key "taggings", "accounts"
  add_foreign_key "taggings", "tags"
  add_foreign_key "tags", "accounts"
  add_foreign_key "users", "accounts", column: "current_account_id"
  add_foreign_key "webhook_deliveries", "accounts"
  add_foreign_key "webhook_deliveries", "webhooks"
  add_foreign_key "webhooks", "accounts"
end
