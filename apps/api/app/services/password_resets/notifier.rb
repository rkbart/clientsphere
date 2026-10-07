module PasswordResets
  # Emails the reset link through the globally configured provider (Resend
  # or Gmail — resets have no workspace context). Failures are logged and
  # swallowed: the request endpoint always reports success so we never reveal
  # whether an address exists, and the owner can retry.
  class Notifier
    DEFAULT_DELIVERY_TIMEOUT = 10

    def self.send_reset(password_reset, raw_token)
      resolved = EmailDelivery.global
      return false if resolved.nil?

      EmailDelivery.deliver(
        resolved,
        to: [password_reset.user.email],
        subject: "Reset your ClientSphere password",
        html: body(password_reset, raw_token),
        timeout: delivery_timeout
      )
      true
    rescue Timeout::Error
      Rails.logger.warn("[PasswordResets::Notifier] delivery timed out after #{delivery_timeout}s")
      false
    rescue StandardError => e
      Rails.logger.warn("[PasswordResets::Notifier] delivery failed (#{e.class}): #{e.message}")
      false
    end

    def self.reset_link(password_reset, raw_token)
      base = ENV.fetch("WEB_URL", "http://localhost:3001")
      "#{base}/reset-password/#{raw_token}"
    end

    def self.delivery_timeout
      Integer(ENV.fetch("EMAIL_DELIVERY_TIMEOUT_SECONDS", DEFAULT_DELIVERY_TIMEOUT.to_s))
    end

    def self.body(password_reset, raw_token)
      link = reset_link(password_reset, raw_token)
      <<~HTML
        <p>We received a request to reset the password for
        <strong>#{ERB::Util.html_escape(password_reset.user.email)}</strong>.</p>
        <p><a href="#{link}">Choose a new password</a>
        (this link expires in 2 hours). If you didn't request this, you can ignore this email.</p>
      HTML
    end
    private_class_method :body, :delivery_timeout, :reset_link
  end
end
