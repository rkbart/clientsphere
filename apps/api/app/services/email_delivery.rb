require "mail"

# Resolves which provider delivers a given send and performs it.
#
# The provider is chosen per workspace via EmailSetting#provider ("resend"
# by default, "gmail" for a company Gmail account through Gmail SMTP with
# an app password). Account-less sends (password resets) use global env
# credentials instead. Returns the provider's message id on success.
class EmailDelivery
  GMAIL_SMTP_ADDRESS = "smtp.gmail.com".freeze
  GMAIL_SMTP_PORT = 587
  DEFAULT_TIMEOUT = 10

  Resolved = Struct.new(:provider, :from, :resend_key, :smtp_username, :smtp_password, keyword_init: true)

  # Per-workspace resolution. Falls back to the global Resend key so
  # workspaces without their own setting keep today's behavior.
  def self.for_account(account)
    setting = account&.email_setting
    from = setting&.from_address.presence || ENV.fetch("EMAIL_FROM_ADDRESS", "noreply@example.com")
    if setting&.gmail? && setting.from_address.present? && setting.smtp_password.present?
      Resolved.new(provider: "gmail", from: from, smtp_username: setting.from_address,
                   smtp_password: setting.smtp_password)
    elsif (key = setting&.resend_api_key.presence || ENV.fetch("RESEND_API_KEY", nil)).present?
      Resolved.new(provider: "resend", from: from, resend_key: key)
    end
  end

  # Global resolution for sends without an account context. Prefers the
  # global Resend key; a Gmail address + app password pair works too.
  def self.global
    from = ENV.fetch("EMAIL_FROM_ADDRESS", "noreply@example.com")
    if ENV.fetch("RESEND_API_KEY", nil).present?
      Resolved.new(provider: "resend", from: from, resend_key: ENV.fetch("RESEND_API_KEY"))
    elsif ENV.fetch("GMAIL_APP_PASSWORD", nil).present?
      address = ENV.fetch("GMAIL_ADDRESS", from)
      Resolved.new(provider: "gmail", from: address, smtp_username: address,
                   smtp_password: ENV.fetch("GMAIL_APP_PASSWORD"))
    end
  end

  def self.deliver(resolved, to:, subject:, html:, text: nil, cc: [], bcc: [], timeout: DEFAULT_TIMEOUT)
    raise ArgumentError, "no delivery provider resolved" if resolved.nil?

    Timeout.timeout(timeout) do
      if resolved.provider == "gmail"
        deliver_smtp(resolved, to: to, cc: cc, bcc: bcc, subject: subject, html: html, text: text)
      else
        deliver_resend(resolved, to: to, cc: cc, bcc: bcc, subject: subject, html: html, text: text)
      end
    end
  end

  def self.deliver_resend(resolved, to:, subject:, html:, text: nil, cc: [], bcc: [])
    Resend.api_key = resolved.resend_key || ""
    params = { from: resolved.from, to: Array(to), subject: subject, html: html }
    params[:text] = text if text.present?
    params[:cc] = Array(cc) if Array(cc).present?
    params[:bcc] = Array(bcc) if Array(bcc).present?
    response = Resend::Emails.send(params)
    response[:id]
  end

  # Gmail sends as the authenticated account, so the username is the Gmail
  # (or Workspace) address itself — it doubles as the From header. SMTP
  # returns no provider id, so stamp our own Message-ID for the audit trail
  # (Gmail preserves client-supplied IDs).
  def self.deliver_smtp(resolved, to:, subject:, html:, text: nil, cc: [], bcc: [])
    mail = build_message(from: resolved.from, to: to, cc: cc, bcc: bcc,
                         subject: subject, html: html, text: text)
    mail.delivery_method :smtp, smtp_settings(username: resolved.smtp_username,
                                              password: resolved.smtp_password)
    mail.deliver!
    mail.message_id
  end

  def self.smtp_settings(username:, password:)
    {
      address: GMAIL_SMTP_ADDRESS,
      port: GMAIL_SMTP_PORT,
      user_name: username,
      # App passwords display as "xxxx xxxx xxxx xxxx" — spaces break SMTP auth.
      password: password.to_s.gsub(/\s+/, ""),
      authentication: :plain,
      enable_starttls: :auto
    }
  end

  def self.build_message(from:, to:, subject:, html:, text: nil, cc: [], bcc: [])
    mail = Mail.new do
      from from
      to Array(to)
      cc Array(cc) if Array(cc).present?
      bcc Array(bcc) if Array(bcc).present?
      subject subject
      text_part { body text } if text.present?
      html_part do
        content_type "text/html; charset=UTF-8"
        body html
      end
    end
    domain = from.to_s.split("@").last.presence || "clientsphere"
    mail.message_id = "<#{SecureRandom.uuid}@#{domain}>"
    mail
  end

  private_class_method :deliver_resend, :deliver_smtp
end
