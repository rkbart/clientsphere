module InboundEmail
  # Normalizes a received message from any provider (Resend webhook, Gmail
  # IMAP, …) into an inbound Email: idempotent on provider_message_id,
  # linked to the sending contact and, via reply headers, to the thread's
  # deal. Fires the email_received automation event for new mail only.
  # Skips mail from the workspace's own sender address (loop guard).
  class Ingest
    Result = Struct.new(:email, :created, keyword_init: true)

    def self.call(account:, from:, subject:, provider:, provider_message_id: nil,
                  message_id: nil, to: [], cc: [], body_text: nil, body_html: nil,
                  in_reply_to: nil, references: [])
      from_address = extract_address(from)
      return Result.new(email: nil, created: false) if from_address.blank?

      own = account.email_setting&.from_address.to_s.strip.downcase
      return Result.new(email: nil, created: false) if own.present? && from_address == own

      if provider_message_id.present?
        existing = account.emails.find_by(provider_message_id: provider_message_id)
        return Result.new(email: existing, created: false) if existing
      end

      contact = account.contacts.kept.where("email ILIKE ?", from_address).first
      parent = find_parent(account, in_reply_to, references)
      contact ||= parent&.contact
      thread_key = parent&.thread_key || parent&.provider_message_id

      email = account.emails.create!(
        direction: :inbound,
        from_address: from_address,
        to_addresses: Array(to).map(&:to_s),
        cc_addresses: Array(cc).map(&:to_s),
        subject: subject.to_s.presence || "(no subject)",
        body: body_text.presence || strip_html(body_html),
        contact: contact,
        deal: parent&.deal,
        status: :delivered,
        sent_at: Time.current,
        provider_message_id: provider_message_id,
        message_id: message_id,
        in_reply_to: in_reply_to,
        thread_key: thread_key || provider_message_id
      )
      Automations::Trigger.call(account, :email_received, email)
      Result.new(email: email, created: true)
    end

    def self.find_parent(account, in_reply_to, references)
      keys = [in_reply_to, *Array(references)].map(&:to_s).reject(&:blank?).uniq
      return nil if keys.empty?

      # Providers disagree on angle brackets around RFC ids, on both the
      # lookup and the stored side — match every combination.
      all = keys.flat_map do |k|
        bare = k.gsub(/\A<|>\z/, "")
        [k, bare, "<#{bare}>"]
      end.uniq
      account.emails.where("provider_message_id IN (?) OR message_id IN (?)", all, all)
             .order(created_at: :desc).first
    end
    private_class_method :find_parent

    def self.strip_html(html)
      return "" if html.blank?

      html.to_s.gsub(%r{</p>}i, "\n\n").gsub(%r{<br\s*/?>}i, "\n").gsub(/<[^>]+>/, "").strip
    end
    private_class_method :strip_html

    # Providers may include a display name ("Jane <jane@…>"); match and
    # store the bare address only.
    def self.extract_address(value)
      raw = value.to_s.strip
      bare = raw[/<([^<>\s]+@[^<>\s]+)>\s*\z/, 1] || raw
      bare.strip.downcase
    end
    private_class_method :extract_address
  end
end
