class CreateAllTables < ActiveRecord::Migration[8.0]
  def change
    # Tenancy & auth
    create_table :accounts, id: :uuid do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.jsonb :settings, default: {}
      t.timestamps
    end
    add_index :accounts, :slug, unique: true

    create_table :users, id: :uuid do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :name, null: false
      t.references :current_account, type: :uuid, foreign_key: { to_table: :accounts }, null: true
      t.timestamps
    end
    add_index :users, :email, unique: true

    create_table :memberships, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.integer :role, null: false, default: 2
      t.datetime :created_at, null: false
    end
    add_index :memberships, [:account_id, :user_id], unique: true

    create_table :invitations, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :email, null: false
      t.integer :role, null: false, default: 2
      t.string :token_digest, null: false
      t.references :invited_by, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.datetime :expires_at, null: false
      t.datetime :accepted_at
      t.datetime :created_at, null: false
    end

    create_table :sessions, id: :uuid do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string :ip_address
      t.string :user_agent
      t.string :token_digest, null: false
      t.datetime :created_at, null: false
    end
    add_index :sessions, :token_digest

    # Companies before contacts
    create_table :companies, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.string :domain
      t.string :industry
      t.string :size_range
      t.decimal :annual_revenue, precision: 14, scale: 2
      t.text :description
      t.references :owner, type: :uuid, null: true, foreign_key: { to_table: :users }
      t.jsonb :custom_data, default: {}
      t.datetime :discarded_at
      t.timestamps
    end

    # Contacts (references companies)
    create_table :contacts, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :first_name, null: false
      t.string :last_name
      t.string :email
      t.string :phone
      t.references :company, type: :uuid, null: true, foreign_key: true
      t.references :owner, type: :uuid, null: true, foreign_key: { to_table: :users }
      t.integer :status, default: 0
      t.string :source
      t.integer :lead_score, default: 0
      t.jsonb :score_reasons, default: []
      t.jsonb :custom_data, default: {}
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :contacts, [:account_id, :email], unique: true, where: "email IS NOT NULL AND discarded_at IS NULL", name: "index_contacts_on_account_and_email_unique"

    create_table :pipelines, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.boolean :is_default, default: false
      t.timestamps
    end

    create_table :stages, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :pipeline, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.integer :position, null: false, default: 0
      t.string :color
      t.integer :probability, default: 0
      t.integer :kind, default: 0
      t.timestamps
    end

    create_table :deals, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :title, null: false
      t.decimal :amount, precision: 12, scale: 2
      t.string :currency, default: "USD"
      t.references :pipeline, type: :uuid, null: false, foreign_key: true
      t.references :stage, type: :uuid, null: false, foreign_key: true
      t.references :contact, type: :uuid, null: true, foreign_key: true
      t.references :company, type: :uuid, null: true, foreign_key: true
      t.references :owner, type: :uuid, null: true, foreign_key: { to_table: :users }
      t.date :expected_close_date
      t.integer :probability, default: 0
      t.integer :position, default: 0
      t.datetime :closed_at
      t.jsonb :custom_data, default: {}
      t.datetime :discarded_at
      t.timestamps
    end

    create_table :activities, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.integer :kind, null: false, default: 4
      t.string :subject, null: false
      t.text :description
      t.references :contact, type: :uuid, null: true, foreign_key: true
      t.references :company, type: :uuid, null: true, foreign_key: true
      t.references :deal, type: :uuid, null: true, foreign_key: true
      t.references :creator, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.references :assignee, type: :uuid, null: true, foreign_key: { to_table: :users }
      t.datetime :due_at
      t.datetime :completed_at
      t.timestamps
    end

    create_table :notes, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.text :body, null: false
      t.string :notable_type, null: false
      t.uuid :notable_id, null: false
      t.references :author, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :notes, [:notable_type, :notable_id]

    create_table :emails, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.integer :direction, null: false
      t.string :from_address
      t.jsonb :to_addresses, default: []
      t.string :subject, null: false
      t.text :body
      t.references :contact, type: :uuid, null: true, foreign_key: true
      t.references :deal, type: :uuid, null: true, foreign_key: true
      t.integer :status, default: 0
      t.datetime :sent_at
      t.datetime :opened_at
      t.timestamps
    end

    create_table :tags, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.string :color
      t.datetime :created_at, null: false
    end
    add_index :tags, [:account_id, :name], unique: true

    create_table :taggings, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :tag, type: :uuid, null: false, foreign_key: true
      t.string :taggable_type, null: false
      t.uuid :taggable_id, null: false
      t.datetime :created_at, null: false
    end
    add_index :taggings, [:tag_id, :taggable_type, :taggable_id], unique: true

    create_table :custom_field_definitions, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :entity_type, null: false
      t.string :key, null: false
      t.string :label, null: false
      t.integer :field_type, null: false, default: 0
      t.jsonb :options, default: {}
      t.boolean :required, default: false
      t.integer :position, default: 0
      t.timestamps
    end
    add_index :custom_field_definitions, [:account_id, :entity_type, :key], unique: true

    create_table :saved_views, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string :entity_type, null: false
      t.string :name, null: false
      t.jsonb :filters, default: {}
      t.jsonb :sort, default: {}
      t.jsonb :columns, default: {}
      t.boolean :shared, default: false
      t.timestamps
    end

    create_table :automations, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.integer :trigger_type, null: false
      t.jsonb :trigger_config, default: {}
      t.jsonb :conditions, default: {}
      t.jsonb :actions, default: {}
      t.boolean :is_active, default: false
      t.timestamps
    end

    create_table :automation_runs, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :automation, type: :uuid, null: false, foreign_key: true
      t.integer :status, default: 0
      t.jsonb :trigger_data, default: {}
      t.jsonb :result, default: {}
      t.datetime :ran_at
      t.timestamps
    end

    create_table :email_sequences, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.boolean :is_active, default: false
      t.timestamps
    end

    create_table :email_sequence_steps, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :sequence, type: :uuid, null: false, foreign_key: { to_table: :email_sequences }
      t.integer :step_order, null: false
      t.integer :delay_days, null: false, default: 0
      t.string :subject, null: false
      t.text :body, null: false
      t.timestamps
    end

    create_table :sequence_enrollments, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :sequence, type: :uuid, null: false, foreign_key: { to_table: :email_sequences }
      t.references :contact, type: :uuid, null: false, foreign_key: true
      t.integer :current_step, null: false, default: 1
      t.integer :status, default: 0
      t.datetime :next_send_at
      t.timestamps
    end

    create_table :webhooks, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :url, null: false
      t.jsonb :events, default: []
      t.text :secret, null: false
      t.boolean :is_active, default: true
      t.datetime :last_triggered_at
      t.timestamps
    end

    create_table :webhook_deliveries, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :webhook, type: :uuid, null: false, foreign_key: true
      t.string :event, null: false
      t.jsonb :payload, default: {}
      t.integer :response_status
      t.integer :attempts, default: 0
      t.datetime :delivered_at
      t.datetime :created_at, null: false
    end

    create_table :ai_settings, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.string :provider, null: false
      t.string :model, null: false
      t.string :base_url
      t.text :api_key
      t.boolean :enabled, default: false
      t.timestamps
    end
    create_table :ai_conversations, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string :title, null: false
      t.timestamps
    end

    create_table :ai_messages, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: true
      t.references :conversation, type: :uuid, null: false, foreign_key: { to_table: :ai_conversations }
      t.integer :role, null: false
      t.text :content, null: false
      t.datetime :created_at, null: false
    end

    create_table :versions do |t|
      t.string :item_type, null: false
      t.bigint :item_id, null: false
      t.string :event, null: false
      t.string :whodunnit
      t.jsonb :object
      t.datetime :created_at
    end
    add_index :versions, [:item_type, :item_id]
  end
end
