module Invitations
  # Emails the accept link for an invitation via Resend when configured.
  # Failures are logged and swallowed: the raw token is still returned in
  # the create response so owners can share the link manually.
  class Notifier
    def self.send_invite(invitation, raw_token)
      return false unless ENV["RESEND_API_KEY"].present?

      Resend.api_key = ENV.fetch("RESEND_API_KEY")
      Resend::Emails.send(
        from: ENV.fetch("EMAIL_FROM_ADDRESS", "noreply@example.com"),
        to: [invitation.email],
        subject: "You've been invited to #{invitation.account.name} on ClientSphere",
        html: invite_body(invitation, raw_token)
      )
      true
    rescue StandardError => e
      Rails.logger.warn("[Invitations::Notifier] delivery failed (#{e.class}): #{e.message}")
      false
    end

    def self.invite_link(invitation, raw_token)
      base = ENV.fetch("WEB_URL", "http://localhost:3001")
      "#{base}/accept-invite/#{raw_token}?email=#{CGI.escape(invitation.email)}"
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
    private_class_method :invite_body
  end
end
