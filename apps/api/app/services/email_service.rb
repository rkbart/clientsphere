# Sends outbound email and records it. Delivery goes through Resend when
# RESEND_API_KEY is set; otherwise the email is kept as a draft record so
# sequences and automations still leave an auditable trail.
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

  def self.send_email(account:, subject:, body:, contact: nil, deal: nil)
    email = account.emails.create!(
      contact: contact,
      deal: deal,
      direction: :outbound,
      from_address: from_address,
      to_addresses: Array(contact&.email).compact,
      subject: subject,
      body: body,
      status: :draft
    )
    return email unless resend_configured?

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

  def self.from_address
    ENV.fetch("EMAIL_FROM_ADDRESS", "noreply@example.com")
  end

  def self.unsubscribe_footer(enrollment)
    return "" unless enrollment

    token = Rails.application.message_verifier("sequence_unsubscribe").generate(enrollment.id)
    url = "#{ENV.fetch('WEB_URL', 'http://localhost:3001')}/unsubscribe/#{token}"
    "\n\n---\n<a href=\"#{url}\">Unsubscribe</a>"
  end

  def self.resend_configured?
    ENV["RESEND_API_KEY"].present?
  end

  def self.deliver(email)
    Resend.api_key = ENV.fetch("RESEND_API_KEY")
    Resend::Emails.send(
      {
        from: email.from_address,
        to: email.to_addresses,
        subject: email.subject,
        html: email.body.to_s
      }
    )
    email.update!(status: :sent, sent_at: Time.current)
    email
  end

  private_class_method :deliver, :from_address, :resend_configured?, :unsubscribe_footer
end
