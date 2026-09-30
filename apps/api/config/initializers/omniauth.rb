# Google OAuth (OmniAuth). Inert unless credentials are set — the app boots
# and runs fine without it. See docs/SETUP.md ("Google OAuth").
# GET request phase: the API-only Rails app has no CSRF-token-issuing HTML
# form, so the Next.js "Continue with Google" link uses GET. OAuth2 state
# verification still protects the callback (OmniAuth + Google `state` param).
OmniAuth.config.allowed_request_methods = [:get]
OmniAuth.config.silence_get_warning = true
# OmniAuth-internal failures (invalid_credentials, csrf_detected, ...) hit
# /auth/failure directly — bounce those to the web login too.
# String reference: controllers aren't loaded when initializers run.
OmniAuth.config.on_failure = ->(env) { "OmniauthCallbacksController".constantize.action(:failure).call(env) }
if ENV["GOOGLE_CLIENT_ID"].present? && ENV["GOOGLE_CLIENT_SECRET"].present?
  Rails.application.config.middleware.use OmniAuth::Builder do
    provider :google_oauth2,
             ENV.fetch("GOOGLE_CLIENT_ID"),
             ENV.fetch("GOOGLE_CLIENT_SECRET"),
             {
               redirect_uri: ENV.fetch(
                 "GOOGLE_REDIRECT_URI",
                 "http://localhost:3000/auth/google_oauth2/callback"
               ),
               scope: "email,profile",
               prompt: "select_account",
             }
  end
end
