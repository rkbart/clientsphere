# Sends through the Gmail HTTPS API on behalf of a user who granted the
# gmail.send scope (captured at Google login as a refresh token). Used
# instead of SMTP where hosts filter submission ports (Render free tier
# drops 25/465/587). Port 443 is never filtered.
class GmailApi
  TOKEN_URL = "https://oauth2.googleapis.com/token".freeze
  SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send".freeze

  # Revoked/expired grants surface here so callers can tell the user to
  # reconnect instead of reporting a generic failure.
  class AuthError < StandardError; end

  def self.access_token(refresh_token)
    response = HTTP.timeout(10).post(TOKEN_URL, form: {
                                       client_id: ENV.fetch("GOOGLE_CLIENT_ID"),
                                       client_secret: ENV.fetch("GOOGLE_CLIENT_SECRET"),
                                       refresh_token: refresh_token,
                                       grant_type: "refresh_token"
                                     })
    body = parse(response)
    raise AuthError, "Google refresh rejected: #{body['error'] || response.status}" unless response.status.success?

    token = body["access_token"]
    raise AuthError, "Google refresh returned no access token" if token.blank?

    token
  end

  # Returns the Gmail message id. Raises AuthError when the grant is dead,
  # StandardError with Google's message otherwise.
  def self.send_email(access_token:, mail:)
    raw = Base64.urlsafe_encode64(mail.to_s)
    response = HTTP.timeout(10).headers(
      authorization: "Bearer #{access_token}",
      content_type: "application/json"
    ).post(SEND_URL, json: { raw: raw })
    body = parse(response)
    raise AuthError, "Gmail rejected the grant: #{body.dig('error', 'message') || response.status}" if response.status == 401
    raise StandardError, "Gmail send failed: #{body.dig('error', 'message') || response.status}" unless response.status.success?
    raise StandardError, "Gmail send returned no message id" if body["id"].blank?

    body["id"]
  end

  def self.parse(response)
    JSON.parse(response.body.to_s)
  rescue JSON::ParserError
    {}
  end
  private_class_method :parse
end
