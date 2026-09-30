# Google OAuth callbacks (public; the signed Google response is the credential).
# The frontend POSTs a form to /auth/google_oauth2 (proxied to the API),
# Google redirects back here, and we bounce the browser to the web app with
# a fresh session token, which it stores and strips from the URL.
class OmniauthCallbacksController < ActionController::API
  def callback
    auth = request.env["omniauth.auth"]
    return bounce_with_error("missing") if auth.nil?

    user = GoogleAuth::Resolver.resolve(auth)
    session = Session.create!(user: user, ip_address: request.remote_ip, user_agent: request.user_agent)
    redirect_to web_callback_url(token: session.token), allow_other_host: true
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.warn("[OAuth] account linking failed: #{e.message}")
    bounce_with_error("linking")
  end

  def failure
    bounce_with_error(params[:message] || params[:error] || "denied")
  end

  private

  def web_callback_url(token:)
    base = ENV.fetch("WEB_URL", "http://localhost:3001")
    "#{base}/auth/google/callback?token=#{CGI.escape(token)}"
  end

  def bounce_with_error(reason)
    base = ENV.fetch("WEB_URL", "http://localhost:3001")
    redirect_to "#{base}/login?oauth_error=#{CGI.escape(reason.to_s)}", allow_other_host: true
  end
end
