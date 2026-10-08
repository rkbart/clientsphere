module InboundEmail
  # Handles a Resend `email.received` webhook: routes the event to the
  # workspace whose inbound address was mailed, fetches the full body
  # through the Receiving API (webhooks carry metadata only), and hands
  # the normalized message to the shared intake.
  class ResendReceiver
    def self.call(account:, event_data:)
      setting = account.email_setting
      return nil if setting&.resend_api_key.blank? && ENV.fetch("RESEND_API_KEY", nil).blank?

      email_id = event_data["email_id"].to_s
      return nil if email_id.blank?

      Resend.api_key = setting&.resend_api_key.presence || ENV.fetch("RESEND_API_KEY")
      retrieved = Resend::Emails::Receiving.get(email_id)

      Ingest.call(
        account: account,
        from: retrieved["from"] || event_data["from"],
        to: retrieved["to"] || event_data["to"] || [],
        cc: retrieved["cc"] || event_data["cc"] || [],
        subject: retrieved["subject"] || event_data["subject"],
        body_text: retrieved["text"],
        body_html: retrieved["html"],
        message_id: retrieved["message_id"] || event_data["message_id"],
        in_reply_to: header(retrieved, "in-reply-to"),
        references: Array(header(retrieved, "references")&.split).flatten,
        provider: "resend",
        provider_message_id: "resend:#{email_id}"
      )
    end

    def self.header(retrieved, name)
      headers = retrieved["headers"] || {}
      headers[name] || headers[name.downcase] || headers[name.upcase]
    end
    private_class_method :header
  end
end
