Rack::Attack.throttled_responder = lambda do |_env, options|
  retry_after = [options[:period] - (Time.now.to_i % options[:period]), 1].max
  [
    429,
    { "Content-Type" => "application/json", "Retry-After" => retry_after.to_s },
    [{ error: "Too many requests. Try again in a few minutes." }.to_json]
  ]
end

# Throttling needs a real cache; fall back to a per-process store when the app
# is configured with :null_store (dev/test).
if Rails.cache.is_a?(ActiveSupport::Cache::NullStore)
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
end
