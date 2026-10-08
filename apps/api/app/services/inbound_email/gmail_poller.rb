require "net/imap"
require "mail"

module InboundEmail
  # Pulls unseen mail from a workspace Gmail inbox over IMAP (app password)
  # and hands each message to the shared intake. Seen flags mark progress,
  # and intake idempotency makes re-polls safe. Per-account errors are
  # logged and skipped so one bad mailbox can't stall the job.
  #
  # NOTE: Render's free tier blocks outbound mail ports; IMAP (993) is
  # likewise unavailable there. Gmail inbound works on self-hosted/paid
  # deploys — on Render free, forward Gmail to the Resend inbound address.
  class GmailPoller
    IMAP_HOST = "imap.gmail.com".freeze
    IMAP_PORT = 993

    def self.call(account)
      setting = account.email_setting
      return 0 unless setting&.gmail? && setting.from_address.present? && setting.smtp_password.present?

      count = 0
      with_imap(setting) do |imap|
        imap.select("INBOX")
        imap.search(["UNSEEN"]).each do |uid|
          fetched = imap.fetch(uid, "RFC822")&.first
          raw = fetched&.attr&.dig("RFC822")
          next if raw.blank?

          ingest_message(account, raw)
          imap.store(uid, "+FLAGS", [:Seen])
          count += 1
        end
      end
      count
    rescue StandardError => e
      Rails.logger.warn("[GmailPoller] account #{account.id} failed (#{e.class}): #{e.message}")
      0
    end

    def self.ingest_message(account, raw)
      mail = Mail.read_from_string(raw)
      text = mail.text_part&.decoded.presence
      text ||= mail.body&.decoded unless mail.multipart?
      Ingest.call(
        account: account,
        from: Array(mail.from).first.to_s,
        to: Array(mail.to),
        cc: Array(mail.cc),
        subject: mail.subject,
        body_text: text,
        body_html: mail.html_part&.decoded,
        message_id: mail.message_id,
        in_reply_to: mail.in_reply_to,
        references: Array(mail.references),
        provider: "gmail",
        provider_message_id: "gmail:#{mail.message_id.presence || SecureRandom.uuid}"
      )
    end

    def self.with_imap(setting)
      imap = Net::IMAP.new(IMAP_HOST, IMAP_PORT, true)
      imap.login(setting.from_address, setting.smtp_password.to_s.gsub(/\s+/, ""))
      yield imap
    ensure
      begin
        imap&.logout
      rescue
        nil
      end
      begin
        imap&.disconnect
      rescue
        nil
      end
    end
    private_class_method :with_imap
  end
end
