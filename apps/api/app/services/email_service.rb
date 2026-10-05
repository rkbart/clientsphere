# Sends outbound email and records it. Delivery goes through Resend when
# configured (per-account email setting first, RESEND_API_KEY fallback);
# otherwise the email is kept as a draft record so sequences and
# automations still leave an auditable trail.
class EmailService
  def self.send_sequence_step(contact, step)
    enrollment = contact.sequence_enrollments.find_by(sequence_id: step.sequence_id, status: :active)
    send_email(
      account: contact.account,
      contact: contact,
      subject: interpolate(step.subject, contact),
      body: interpolate(step.body, contact) + unsubscribe_footer(enrollment)
    )
  end

  def self.send_email(account:, subject:, body:, contact: nil, deal: nil, to_addresses: nil, cc_addresses: [], bcc_addresses: [])
    email = account.emails.create!(
      contact: contact,
      deal: deal,
      direction: :outbound,
      from_address: from_address(account),
      to_addresses: Array(to_addresses).presence || Array(contact&.email).compact,
      cc_addresses: Array(cc_addresses),
      bcc_addresses: Array(bcc_addresses),
      subject: subject,
      body: body,
      status: :draft
    )
    return email unless resend_configured?(account)

    deliver(email)
  rescue StandardError => e
    email.update!(status: :failed)
    Rails.logger.warn("[EmailService] delivery failed (#{e.class}): #{e.message}")
    email
  end

  def self.interpolate(template, contact)
    template.to_s
            .gsub("{{first_name}}", contact.first_name.to_s)
            .gsub("{{last_name}}", contact.last_name.to_s)
            .gsub("{{email}}", contact.email.to_s)
            .gsub("{{company}}", contact.company&.name.to_s)
  end

  def self.from_address(account = nil)
    setting_address = account&.email_setting&.from_address.presence
    setting_address || ENV.fetch("EMAIL_FROM_ADDRESS", "noreply@example.com")
  end

  def self.unsubscribe_footer(enrollment)
    return "" unless enrollment

    token = Rails.application.message_verifier("sequence_unsubscribe").generate(enrollment.id)
    url = "#{ENV.fetch('WEB_URL', 'http://localhost:3001')}/unsubscribe/#{token}"
    "\n\n---\n<a href=\"#{url}\">Unsubscribe</a>"
  end

  def self.resend_configured?(account = nil)
    resend_api_key(account).present?
  end

  def self.resend_api_key(account = nil)
    account&.email_setting&.resend_api_key.presence || ENV.fetch("RESEND_API_KEY", nil)
  end

  def self.redeliver(email)
    return email unless resend_configured?(email.account)

    deliver(email)
  rescue StandardError => e
    email.update!(status: :failed)
    Rails.logger.warn("[EmailService] redelivery failed (#{e.class}): #{e.message}")
    email
  end

  def self.deliver(email)
    Resend.api_key = resend_api_key(email.account) || ""
    params = {
      from: email.from_address,
      to: email.to_addresses,
      subject: email.subject,
      html: to_html(email.body),
      text: to_text(email.body)
    }
    params[:cc] = email.cc_addresses if email.cc_addresses.present?
    params[:bcc] = email.bcc_addresses if email.bcc_addresses.present?
    response = Resend::Emails.send(params)
    email.update!(status: :sent, sent_at: Time.current, provider_message_id: response[:id])
    email
  end

  # Composed bodies are plain text with blank-line paragraph breaks. Sending
  # that as raw HTML collapses every newline into a single run-on line, so
  # blank lines become paragraphs and single newlines become <br>.
  def self.to_html(body)
    text = body.to_s
    return "" if text.blank?

    paragraphs = text.split(/\n{2,}/).map(&:strip).reject(&:empty?)
    paragraphs.map do |p|
      "<p>#{ERB::Util.html_escape(p).gsub("\n", "<br>\n")}</p>"
    end.join("\n")
  end

  # Plain-text alternative for clients that prefer it. Existing markup is
  # stripped so the text part does not read like a wall of tags.
  def self.to_text(body)
    body.to_s.gsub(%r{</p>}i, "\n\n").gsub(%r{<br\s*/?>}i, "\n").gsub(/<[^>]+>/, "").strip
  end

  private_class_method :deliver, :from_address, :resend_configured?, :resend_api_key,
                       :unsubscribe_footer, :to_html, :to_text
end
