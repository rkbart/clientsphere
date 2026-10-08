# Google OAuth callbacks (public; the signed Google response is the credential).
# The frontend links to /auth/google_oauth2 (rewritten to the API, GET request
# phase), Google redirects back here, and we bounce the browser to the web app
# with a fresh session token, which it stores and strips from the URL.
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
    # on_failure calls this action directly (no redirect), so the strategy
    # and reason live in the OmniAuth env, not in params.
    strategy = params[:strategy].presence || request.env["omniauth.strategy"]&.name
    reason = params[:message].presence || params[:error].presence ||
             request.env["omniauth.error.type"]&.to_s || "denied"
    if strategy == "google_connect"
      bounce_settings(reason)
    else
      bounce_with_error(reason)
    end
  end

  # Workspace Gmail connect callback (owner/admin only, verified below).
  # Stores the grant on the workspace email setting so every member sends
  # as the connected address — no one needs to log in with that Google
  # account themselves.
  def gmail_connect
    auth = request.env["omniauth.auth"]
    ids = session.delete("gmail_connect") || {}
    return bounce_settings("missing") if auth.nil?

    user = User.find_by(id: ids["user_id"])
    account = Account.find_by(id: ids["account_id"])
    unless user && account && %w[owner admin].include?(user.role_for(account))
      return bounce_settings("unauthorized")
    end

    refresh_token = auth.dig("credentials", "refresh_token").to_s
    gmail_address = auth.dig("info", "email").to_s.downcase
    # Google only returns a refresh token on a consented grant; without it
    # there is nothing to store (user likely has a permanent grant — they
    # must revoke it in their Google account and reconnect).
    return bounce_settings("no_grant") if refresh_token.blank? || gmail_address.blank?

    setting = account.email_setting || account.build_email_setting
    setting.update!(
      gmail_refresh_token: refresh_token,
      gmail_address: gmail_address,
      gmail_grant_revoked: false
    )
    redirect_to "#{web_base}/settings/email?gmail_connected=1", allow_other_host: true
  end

  private

  def web_base
    ENV.fetch("WEB_URL", "http://localhost:3001")
  end

  def bounce_settings(reason)
    redirect_to "#{web_base}/settings/email?gmail_error=#{CGI.escape(reason.to_s)}", allow_other_host: true
  end

  def web_callback_url(token:)
    base = ENV.fetch("WEB_URL", "http://localhost:3001")
    "#{base}/auth/google/callback?token=#{CGI.escape(token)}"
  end

  def bounce_with_error(reason)
    base = ENV.fetch("WEB_URL", "http://localhost:3001")
    redirect_to "#{base}/login?oauth_error=#{CGI.escape(reason.to_s)}", allow_other_host: true
  end
end
