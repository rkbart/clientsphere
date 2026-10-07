require "rails_helper"

# NOTE: never stub Mail::SMTP.new here. The mail gem memoizes its global
# default delivery handler, so a stubbed constructor poisons every later
# Mail.new in the process (leaked-double failures). Stub EmailDelivery
# itself (our own seam) or assert on real Mail objects instead.
RSpec.describe EmailDelivery do
  let(:account) { Account.create!(name: "Acme") }

  describe ".for_account" do
    it "returns nil when nothing is configured" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => nil))

      expect(described_class.for_account(account)).to be_nil
    end

    it "resolves resend from the global key with the default from address" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_env", "EMAIL_FROM_ADDRESS" => "env@example.com"))

      resolved = described_class.for_account(account)

      expect(resolved.provider).to eq("resend")
      expect(resolved.resend_key).to eq("re_env")
      expect(resolved.from).to eq("env@example.com")
    end

    it "prefers the workspace resend key over the global one" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_env", "EMAIL_FROM_ADDRESS" => "env@example.com"))
      account.create_email_setting!(resend_api_key: "re_account", from_address: "me@example.com")

      resolved = described_class.for_account(account)

      expect(resolved.provider).to eq("resend")
      expect(resolved.resend_key).to eq("re_account")
      expect(resolved.from).to eq("me@example.com")
    end

    it "resolves gmail from the workspace setting" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_env"))
      account.create_email_setting!(provider: "gmail", from_address: "me@gmail.com", smtp_password: "app-pass")

      resolved = described_class.for_account(account)

      expect(resolved.provider).to eq("gmail")
      expect(resolved.from).to eq("me@gmail.com")
      expect(resolved.smtp_username).to eq("me@gmail.com")
      expect(resolved.smtp_password).to eq("app-pass")
    end

    it "ignores an incomplete gmail setting and falls back to resend" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_env"))
      account.create_email_setting!(provider: "gmail", from_address: "me@gmail.com")

      expect(described_class.for_account(account).provider).to eq("resend")
    end
  end

  describe ".global" do
    it "returns nil without any credentials" do
      stub_const("ENV", ENV.to_h.except("RESEND_API_KEY", "GMAIL_APP_PASSWORD"))

      expect(described_class.global).to be_nil
    end

    it "prefers the global resend key" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_env", "GMAIL_APP_PASSWORD" => "app-pass",
                                       "GMAIL_ADDRESS" => "me@gmail.com"))

      expect(described_class.global.provider).to eq("resend")
    end

    it "resolves gmail from env when no resend key exists" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => nil, "GMAIL_ADDRESS" => "me@gmail.com",
                                       "GMAIL_APP_PASSWORD" => "app-pass"))

      resolved = described_class.global

      expect(resolved.provider).to eq("gmail")
      expect(resolved.from).to eq("me@gmail.com")
      expect(resolved.smtp_username).to eq("me@gmail.com")
    end
  end

  describe ".smtp_settings" do
    it "points at Gmail with direct TLS" do
      expect(described_class.smtp_settings(username: "me@gmail.com", password: "app-pass")).to eq(
        address: "smtp.gmail.com", port: 465, user_name: "me@gmail.com",
        password: "app-pass", authentication: :plain, tls: true
      )
    end
  end

  describe ".build_message" do
    it "builds a multipart message with our own message id" do
      mail = described_class.build_message(
        from: "me@gmail.com", to: ["you@example.com"], cc: ["cc@example.com"],
        subject: "Hi", html: "<p>Hello</p>", text: "Hello"
      )

      expect(mail.from).to eq(["me@gmail.com"])
      expect(mail.to).to eq(["you@example.com"])
      expect(mail.cc).to eq(["cc@example.com"])
      expect(mail.subject).to eq("Hi")
      expect(mail.text_part.body.decoded).to eq("Hello")
      expect(mail.html_part.body.decoded).to include("<p>Hello</p>")
      expect(mail.message_id).to match(/@gmail\.com\z/)
    end

    it "omits the text part when no text is given" do
      mail = described_class.build_message(
        from: "me@gmail.com", to: ["you@example.com"], subject: "Hi", html: "<p>Hello</p>"
      )

      expect(mail.text_part).to be_nil
      expect(mail.html_part).not_to be_nil
    end
  end

  describe ".deliver" do
    it "rejects a nil resolution" do
      expect do
        described_class.deliver(nil, to: ["you@example.com"], subject: "Hi", html: "<p>Hi</p>")
      end.to raise_error(ArgumentError)
    end

    it "dispatches resend resolutions to the Resend API" do
      resolved = described_class::Resolved.new(provider: "resend", from: "me@example.com", resend_key: "re_x")
      allow(described_class).to receive(:deliver_resend).and_return("re_123")

      id = described_class.deliver(resolved, to: ["you@example.com"], subject: "Hi", html: "<p>Hi</p>")

      expect(id).to eq("re_123")
      expect(described_class).to have_received(:deliver_resend)
    end

    it "dispatches gmail resolutions to SMTP" do
      resolved = described_class::Resolved.new(provider: "gmail", from: "me@gmail.com",
                                               smtp_username: "me@gmail.com", smtp_password: "app-pass")
      allow(described_class).to receive(:deliver_smtp).and_return("<uuid@gmail.com>")

      id = described_class.deliver(resolved, to: ["you@example.com"], subject: "Hi", html: "<p>Hi</p>")

      expect(id).to eq("<uuid@gmail.com>")
      expect(described_class).to have_received(:deliver_smtp)
    end
  end
end
