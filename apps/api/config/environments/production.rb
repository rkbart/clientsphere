Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false
  config.action_controller.perform_caching = true
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present?
  config.force_ssl = true
  # TLS terminates at the platform proxy (Render); trust its
  # X-Forwarded-Proto instead of redirect-looping plain-http internals.
  config.assume_ssl = true
  config.active_support.deprecation = :notify
  config.active_support.disallowed_deprecation = :raise
  config.active_support.disallowed_deprecation_warnings = []
  config.log_tags = [:request_id]
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  # Solid Cache + Solid Queue back the app in production (single database).
  config.cache_store = :solid_cache_store
end
