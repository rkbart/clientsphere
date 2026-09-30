require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_cable/engine"

Bundler.require(*Rails.groups)

module ClientSphere
  class Application < Rails::Application
    config.load_defaults 8.0
    config.api_only = true

    # OmniAuth needs session middleware for OAuth state
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore, key: "_clientsphere_session"
    config.middleware.use ActionDispatch::Flash

    config.active_record.encryption.primary_key = ENV.fetch("ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY", "primary-key")
    config.active_record.encryption.deterministic_key = ENV.fetch("ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY", "deterministic-key")
    config.active_record.encryption.key_derivation_salt = ENV.fetch("ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT", "key-derivation-salt")

    # Background jobs run on Solid Queue (same Postgres database, see
    # config/queue.yml). The test env overrides this with :test.
    config.active_job.queue_adapter = :solid_queue
    config.solid_queue.connects_to = { database: { writing: :primary } }
  end
end
