module Invitations
  # Emails the accept link through the workspace's configured provider
  # (Gmail or Resend), falling back to the global credentials.
  # Failures are logged and swallowed: the raw token is still returned in
  # the create response so owners can share the link manually.
  class Notifier
    # Delivery normally answers in ~1s; a hung socket must not block the
    # request past the proxy timeout (60s), so cap delivery tightly.
    DEFAULT_DELIVERY_TIMEOUT = 10

    def self.send_invite(invitation, raw_token)
      resolved = EmailDelivery.for_account(invitation.account) || EmailDelivery.global
      return false if resolved.nil?

      EmailDelivery.deliver(
        resolved,
        to: [invitation.email],
        subject: "You've been invited to #{invitation.account.name} on ClientSphere",
        html: invite_body(invitation, raw_token),
        timeout: delivery_timeout
      )
      true
    rescue Timeout::Error
      Rails.logger.warn("[Invitations::Notifier] delivery timed out after #{delivery_timeout}s")
      false
    rescue StandardError => e
      Rails.logger.warn("[Invitations::Notifier] delivery failed (#{e.class}): #{e.message}")
      false
    end

    def self.invite_link(invitation, raw_token)
      base = ENV.fetch("WEB_URL", "http://localhost:3001")
      "#{base}/accept-invite/#{raw_token}?email=#{CGI.escape(invitation.email)}"
    end

    def self.delivery_timeout
      Integer(ENV.fetch("INVITE_DELIVERY_TIMEOUT_SECONDS", DEFAULT_DELIVERY_TIMEOUT.to_s))
    end

    def self.invite_body(invitation, raw_token)
      link = invite_link(invitation, raw_token)
      <<~HTML
        <p>#{ERB::Util.html_escape(invitation.invited_by.name)} invited you to join
        <strong>#{ERB::Util.html_escape(invitation.account.name)}</strong>
        on ClientSphere as #{invitation.role}.</p>
        <p><a href="#{link}">Accept invitation</a> (expires #{invitation.expires_at.to_date})</p>
      HTML
    end
    private_class_method :invite_body, :delivery_timeout
  end
end
