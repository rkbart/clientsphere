# Google OAuth (OmniAuth). Inert in production unless credentials are set —
# the app boots and runs fine without it. See docs/SETUP.md ("Google OAuth").
# In test we always mount with dummy credentials so OmniAuth test_mode mocks
# work without real secrets (CI has no GOOGLE_* env vars).
# GET request phase: the API-only Rails app has no CSRF-token-issuing HTML
# form, so the Next.js "Continue with Google" link uses GET. OAuth2 state
# verification still protects the callback (OmniAuth + Google `state` param).
OmniAuth.config.allowed_request_methods = [:get]
OmniAuth.config.silence_get_warning = true
# OmniAuth-internal failures (invalid_credentials, csrf_detected, ...) hit
# /auth/failure directly — bounce those to the web login too.
# String reference: controllers aren't loaded when initializers run.
OmniAuth.config.on_failure = ->(env) { "OmniauthCallbacksController".constantize.action(:failure).call(env) }
google_client_id = ENV["GOOGLE_CLIENT_ID"].presence
google_client_secret = ENV["GOOGLE_CLIENT_SECRET"].presence
if Rails.env.test? && (google_client_id.blank? || google_client_secret.blank?)
  # Dummy credentials so the OmniAuth strategy is mounted and test_mode mocks
  # work without real secrets (CI has no GOOGLE_* env vars).
  # NOTE: plain assignment (not ||=) — an empty-string env var is truthy in
  # Ruby, so ||= would keep the blank value and the strategy would stay
  # unmounted.
  ENV["GOOGLE_CLIENT_ID"] = "test-client-id" if google_client_id.blank?
  ENV["GOOGLE_CLIENT_SECRET"] = "test-client-secret" if google_client_secret.blank?
end
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
               scope: "email,profile,https://www.googleapis.com/auth/gmail.send",
               # offline + consent: Google only issues a refresh token on a
               # consented grant, so repeat logins must re-consent to (re)link
               # Gmail API sending for the workspace provider.
               access_type: "offline",
               prompt: "select_account consent",
             }
  end
end
