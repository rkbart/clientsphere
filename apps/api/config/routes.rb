Rails.application.routes.draw do
  # Platform health checks (Render healthCheckPath, load balancers).
  get "up" => "rails/health#show", as: :rails_health_check

  # Solid Queue dashboard (HTTP basic auth, see config/initializers/mission_control_jobs.rb)
  mount MissionControl::Jobs::Engine, at: "/jobs"

  # GraphQL API
  post "/graphql", to: "graphql#execute"

  # Swagger UI + generated OpenAPI (see lib/tasks/openapi.rake)
  mount Rswag::Api::Engine => "/api-docs"
  mount Rswag::Ui::Engine => "/api-docs"

  # Google OAuth (OmniAuth request phase lives at /auth/google_oauth2)
  match "/auth/:provider/callback", to: "omniauth_callbacks#callback", via: [:get, :post]
  match "/auth/failure", to: "omniauth_callbacks#failure", via: [:get, :post]

  namespace :api do
    namespace :v1 do
      # Auth
      post "auth/signup", to: "auth#signup"
      post "auth/login", to: "auth#login"
      delete "auth/logout", to: "auth#logout"
      get "auth/me", to: "auth#me"
      get "auth/providers", to: "auth#providers"
      post "auth/switch_account", to: "auth#switch_account"

      # Workspaces (any member may create/rename; delete is owner-only and
      # never the last remaining one)
      resources :accounts, only: [:index, :create, :update, :destroy]

      # Current user (name update, welcome banner dismissal)
      patch "users/me", to: "users#me"

      # Password reset (public: locked-out users have no session)
      resources :password_resets, only: [:create] do
        patch :update
      end

      # Invitations
      resources :invitations, only: [:index, :create, :destroy] do
        member do
          post :accept
        end
      end

      # Memberships
      resources :memberships, only: [:index, :update, :destroy]

      # CRM Resources
      resources :contacts do
        member do
          get :export
          delete :erase
          post :score
        end
        collection do
          post :import
        end
        resources :tags, only: [:index, :create, :destroy], controller: "contact_tags"
      end

      resources :companies do
        resources :tags, only: [:index, :create, :destroy], controller: "company_tags"
      end

      resources :deals do
        collection do
          get :attention
        end
        member do
          patch :move
          get :summary
        end
        resources :tags, only: [:index, :create, :destroy], controller: "deal_tags"
      end

      resources :pipelines do
        resources :stages
      end

      resources :activities do
        collection do
          post :bulk_complete
        end
      end
      resources :notes
      resources :emails do
        collection do
          get :templates
          get :unread_count
          post :deliver
          post :mark_all_read
        end
        member do
          post :redeliver
          post :mark_read
        end
      end

      # Tags
      resources :tags, only: [:index, :create, :destroy]

      # Custom Fields
      resources :custom_field_definitions

      # Custom Objects
      resources :custom_object_definitions do
        resources :records, controller: "custom_object_records", only: [:index, :create]
      end
      resources :custom_object_records, only: [:show, :update, :destroy]

      # Plugins
      resources :plugins

      # Automations
      resources :automations do
        collection do
          get :templates
        end
        member do
          post :toggle
          get :runs
        end
      end

      # Email Sequences
      resources :email_sequences do
        resources :steps, controller: "email_sequence_steps"
        resources :enrollments, controller: "sequence_enrollments", only: [:index]
        member do
          post :enroll
        end
      end
      resources :sequence_enrollments, only: [:destroy] do
        member do
          post :unsubscribe
        end
      end

      # Public unsubscribe (signed token, no login)
      post "unsubscribe", to: "unsubscribes#create"

      # Email settings (owner/admin only)
      get "email_settings", to: "email_settings#show"
      patch "email_settings", to: "email_settings#update"

      # Inbound Resend tracking webhooks (Svix-signed, per-account URL)
      post "webhooks/resend/:account_id", to: "resend_webhooks#create"

      # Webhooks
      resources :webhooks do
        member do
          get :deliveries
        end
      end

      # Import/Export
      post "import/csv", to: "import#create"
      get "export/csv/:type", to: "export#show"

      # Personal access tokens
      resources :api_tokens, only: [:index, :create, :destroy]
    end
  end
end
