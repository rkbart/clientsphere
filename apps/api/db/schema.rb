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

ActiveRecord::Schema[8.1].define(version: 2026_10_03_123623) do
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
    t.datetime "overdue_fired_at"
    t.index ["account_id"], name: "index_activities_on_account_id"
    t.index ["assignee_id"], name: "index_activities_on_assignee_id"
    t.index ["company_id"], name: "index_activities_on_company_id"
    t.index ["contact_id"], name: "index_activities_on_contact_id"
    t.index ["creator_id"], name: "index_activities_on_creator_id"
    t.index ["deal_id"], name: "index_activities_on_deal_id"
  end

  create_table "api_tokens", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.string "prefix", null: false
    t.string "token_digest", null: false
    t.datetime "last_used_at"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "name"], name: "index_api_tokens_on_account_id_and_name", unique: true
    t.index ["account_id"], name: "index_api_tokens_on_account_id"
    t.index ["token_digest"], name: "index_api_tokens_on_token_digest", unique: true
    t.index ["user_id"], name: "index_api_tokens_on_user_id"
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
    t.integer "delay_days", default: 0, null: false
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
    t.string "address"
    t.jsonb "social_links", default: [], null: false
    t.uuid "added_by_id"
    t.uuid "main_contact_id"
    t.index ["account_id"], name: "index_companies_on_account_id"
    t.index ["added_by_id"], name: "index_companies_on_added_by_id"
    t.index ["main_contact_id"], name: "index_companies_on_main_contact_id"
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
    t.string "job_title"
    t.string "city"
    t.jsonb "social_links", default: [], null: false
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

  create_table "custom_object_definitions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "name", null: false
    t.string "icon", default: "📦"
    t.jsonb "fields", default: []
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "name"], name: "index_custom_object_definitions_on_account_id_and_name", unique: true
    t.index ["account_id"], name: "index_custom_object_definitions_on_account_id"
  end

  create_table "custom_object_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "custom_object_definition_id", null: false
    t.jsonb "data", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "custom_object_definition_id"], name: "idx_on_account_id_custom_object_definition_id_64cdcb7416"
    t.index ["account_id"], name: "index_custom_object_records_on_account_id"
    t.index ["custom_object_definition_id"], name: "index_custom_object_records_on_custom_object_definition_id"
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
    t.integer "probability"
    t.integer "position", default: 0
    t.datetime "closed_at"
    t.jsonb "custom_data", default: {}
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "source"
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

  create_table "email_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.text "resend_api_key"
    t.string "from_address"
    t.text "webhook_secret"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_email_settings_on_account_id", unique: true
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
    t.jsonb "cc_addresses", default: [], null: false
    t.jsonb "bcc_addresses", default: [], null: false
    t.string "provider_message_id"
    t.index ["account_id"], name: "index_emails_on_account_id"
    t.index ["contact_id"], name: "index_emails_on_contact_id"
    t.index ["deal_id"], name: "index_emails_on_deal_id"
    t.index ["provider_message_id"], name: "index_emails_on_provider_message_id", unique: true
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

  create_table "password_resets", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "token_digest", null: false
    t.datetime "expires_at", null: false
    t.datetime "used_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token_digest"], name: "index_password_resets_on_token_digest", unique: true
    t.index ["user_id"], name: "index_password_resets_on_user_id"
  end

  create_table "pipelines", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "name", null: false
    t.boolean "is_default", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_pipelines_on_account_id"
  end

  create_table "plugins", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "name", null: false
    t.string "description"
    t.jsonb "triggers", default: []
    t.string "webhook_url"
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "name"], name: "index_plugins_on_account_id_and_name", unique: true
    t.index ["account_id"], name: "index_plugins_on_account_id"
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

  create_table "solid_cable_messages", force: :cascade do |t|
    t.binary "channel", null: false
    t.binary "payload", null: false
    t.datetime "created_at", null: false
    t.bigint "channel_hash", null: false
    t.index ["channel_hash"], name: "index_solid_cable_messages_on_channel_hash"
    t.index ["created_at"], name: "index_solid_cable_messages_on_created_at"
  end

  create_table "solid_cache_entries", force: :cascade do |t|
    t.binary "key", null: false
    t.binary "value", null: false
    t.datetime "created_at", null: false
    t.bigint "key_hash", null: false
    t.integer "byte_size", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "solid_queue_batch_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "batch_id", null: false
    t.datetime "created_at", null: false
    t.index ["batch_id"], name: "index_solid_queue_batch_executions_on_batch_id"
    t.index ["job_id"], name: "index_solid_queue_batch_executions_on_job_id", unique: true
  end

  create_table "solid_queue_batches", force: :cascade do |t|
    t.string "active_job_batch_id"
    t.string "description"
    t.text "on_finish"
    t.text "on_success"
    t.text "on_failure"
    t.text "metadata"
    t.integer "total_jobs", default: 0, null: false
    t.integer "completed_jobs", default: 0, null: false
    t.integer "failed_jobs", default: 0, null: false
    t.datetime "enqueued_at"
    t.datetime "finished_at"
    t.datetime "failed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active_job_batch_id"], name: "index_solid_queue_batches_on_active_job_batch_id", unique: true
    t.index ["finished_at"], name: "index_solid_queue_batches_on_finished_at"
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.string "concurrency_key", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.text "error"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "queue_name", null: false
    t.string "class_name", null: false
    t.text "arguments"
    t.integer "priority", default: 0, null: false
    t.string "active_job_id"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "batch_id"
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["batch_id"], name: "index_solid_queue_jobs_on_batch_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.string "queue_name", null: false
    t.datetime "created_at", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.bigint "supervisor_id"
    t.integer "pid", null: false
    t.string "hostname"
    t.text "metadata"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "task_key", null: false
    t.datetime "run_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.string "key", null: false
    t.string "schedule", null: false
    t.string "command", limit: 2048
    t.string "class_name"
    t.text "arguments"
    t.string "queue_name"
    t.integer "priority", default: 0
    t.boolean "static", default: true, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "scheduled_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.string "key", null: false
    t.integer "value", default: 1, null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
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
    t.string "google_uid"
    t.datetime "welcome_seen_at"
    t.index ["current_account_id"], name: "index_users_on_current_account_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["google_uid"], name: "index_users_on_google_uid", unique: true
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
    t.integer "status", default: 0, null: false
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
  add_foreign_key "api_tokens", "accounts"
  add_foreign_key "api_tokens", "users"
  add_foreign_key "automation_runs", "accounts"
  add_foreign_key "automation_runs", "automations"
  add_foreign_key "automations", "accounts"
  add_foreign_key "companies", "accounts"
  add_foreign_key "companies", "contacts", column: "main_contact_id"
  add_foreign_key "companies", "users", column: "added_by_id"
  add_foreign_key "companies", "users", column: "owner_id"
  add_foreign_key "contacts", "accounts"
  add_foreign_key "contacts", "companies"
  add_foreign_key "contacts", "users", column: "owner_id"
  add_foreign_key "custom_field_definitions", "accounts"
  add_foreign_key "custom_object_definitions", "accounts"
  add_foreign_key "custom_object_records", "accounts"
  add_foreign_key "custom_object_records", "custom_object_definitions"
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
  add_foreign_key "password_resets", "users"
  add_foreign_key "pipelines", "accounts"
  add_foreign_key "plugins", "accounts"
  add_foreign_key "sequence_enrollments", "accounts"
  add_foreign_key "sequence_enrollments", "contacts"
  add_foreign_key "sequence_enrollments", "email_sequences", column: "sequence_id"
  add_foreign_key "sessions", "users"
  add_foreign_key "solid_queue_batch_executions", "solid_queue_batches", column: "batch_id", on_delete: :cascade
  add_foreign_key "solid_queue_batch_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
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
