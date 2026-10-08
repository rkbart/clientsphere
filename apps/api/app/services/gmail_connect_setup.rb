# OmniAuth setup phase for the workspace Gmail connect strategy. Verifies
# the signed handoff token (minted by an authenticated owner/admin via
# POST /api/v1/email_settings/gmail_connect_token) and stashes the
# account/user ids in the cookie session for the callback to consume.
# Raising here lands on the failure endpoint, which bounces to settings.
class GmailConnectSetup
  def self.call(env)
    request = Rack::Request.new(env)
    # OmniAuth runs setup on the callback phase as well — the handoff only
    # needs verifying at request time; the callback consumes the session.
    strategy = env["omniauth.strategy"]
    if strategy
      Rails.logger.info(
        "[GmailConnect] client_id=#{strategy.options[:client_id].to_s[0, 12]}… " \
        "redirect_uri=#{strategy.options[:redirect_uri]}"
      )
    end
    return if request.path.include?("/callback")

    raw = request.params["connect_token"].to_s
    payload = verifier.verify(raw, purpose: "gmail_connect")
    session = env["rack.session"] || {}
    session["gmail_connect"] = {
      "account_id" => payload[:account_id] || payload["account_id"],
      "user_id" => payload[:user_id] || payload["user_id"]
    }
  rescue ActiveSupport::MessageVerifier::InvalidSignature
    raise OmniAuth::Error, "invalid connect token"
  end

  def self.verifier
    Rails.application.message_verifier("gmail_connect")
  end
end
