Rails.application.routes.draw do
  # API Documentation
  get "/api-docs", to: "rswag/ui/apps#swagger", defaults: { app_path: "openapi.yaml" }

  namespace :api do
    namespace :v1 do
      # Auth
      post "auth/signup", to: "auth#signup"
      post "auth/login", to: "auth#login"
      delete "auth/logout", to: "auth#logout"
      get "auth/me", to: "auth#me"
      post "auth/switch_account", to: "auth#switch_account"

      # Invitations
      resources :invitations, only: [:create] do
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
        member do
          patch :move
        end
        resources :tags, only: [:index, :create, :destroy], controller: "deal_tags"
      end

      resources :pipelines do
        resources :stages, only: [:index, :create]
      end

      resources :stages, only: [:update, :destroy]

      resources :activities
      resources :notes
      resources :emails

      # Tags
      resources :tags, only: [:index, :create, :destroy]

      # Custom Fields
      resources :custom_field_definitions

      # Saved Views
      resources :saved_views

      # Automations
      resources :automations do
        member do
          post :toggle
          get :runs
        end
      end

      # Email Sequences
      resources :email_sequences do
        resources :steps, controller: "email_sequence_steps"
        member do
          post :enroll
        end
      end

      # Webhooks
      resources :webhooks do
        member do
          get :deliveries
        end
      end

      # AI
      get "ai/settings", to: "ai#settings"
      patch "ai/settings", to: "ai#update_settings"
      post "ai/test_connection", to: "ai#test_connection"
      post "ai/chat", to: "ai#chat"
      post "ai/draft_email", to: "ai#draft_email"
      post "ai/suggest_next_action", to: "ai#suggest_next_action"
      post "ai/enrich", to: "ai#enrich"
      post "ai/summarize_deal", to: "ai#summarize_deal"

      # Import/Export
      post "import/csv", to: "import#create"
      get "import/:id", to: "import#show"
      get "export/csv/:type", to: "export#show"
    end
  end
end
