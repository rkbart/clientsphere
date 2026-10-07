# Puma configuration for development and production (Render).
# Render injects PORT; threads/workers stay tunable via env so the free
# tier (single process) and paid tiers need no file changes.
max_threads_count = ENV.fetch("RAILS_MAX_THREADS", 5)
min_threads_count = ENV.fetch("RAILS_MIN_THREADS", max_threads_count)
threads min_threads_count, max_threads_count

port ENV.fetch("PORT", 3000)

environment ENV.fetch("RAILS_ENV", "development")

pidfile ENV.fetch("PIDFILE", "tmp/pids/server.pid")

workers ENV.fetch("WEB_CONCURRENCY", 0)
preload_app! if ENV.fetch("WEB_CONCURRENCY", 0).to_i.positive?

# Solid Queue inside Puma: Render free tier has no background workers, so
# the web service doubles as the job runner. Async mode keeps everything in
# threads (flat memory, suits 512 MB). Jobs only run while the service is
# awake — same sleep caveat as the free worker would have.
if ENV["SOLID_QUEUE_IN_PUMA"]
  plugin :solid_queue
  solid_queue_mode :async
end

plugin :tmp_restart
