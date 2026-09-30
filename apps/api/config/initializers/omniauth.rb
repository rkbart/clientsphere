# Google OAuth (OmniAuth). Inert unless credentials are set — the app boots
# and runs fine without it. See docs/SETUP.md ("Google OAuth").
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
