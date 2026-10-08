require "rails_helper"

RSpec.describe PasswordResets::Notifier do
  let(:user) { User.create!(name: "User", email: "user-reset@example.com", password: "password123") }
  let(:password_reset) { PasswordReset.create!(user: user) }

  describe ".send_reset" do
    it "passes a single positional hash to Resend" do
      stub_const(
        "ENV",
        ENV.to_h.merge("RESEND_API_KEY" => "re_test", "EMAIL_FROM_ADDRESS" => "noreply@example.com")
      )
      sender = class_double("Resend::Emails").as_stubbed_const
      allow(sender).to receive(:send).and_return({ id: "msg_1" })

      expect(described_class.send_reset(password_reset, password_reset.token)).to be(true)
      expect(sender).to have_received(:send) do |params|
        expect(params).to be_a(Hash)
        expect(params[:to]).to eq(["user-reset@example.com"])
        expect(params[:subject]).to include("password")
      end
    end

    it "delivers through the global Gmail account when configured" do
      stub_const(
        "ENV",
        ENV.to_h.merge(
          "RESEND_API_KEY" => nil,
          "GMAIL_ADDRESS" => "me@gmail.com",
          "GMAIL_APP_PASSWORD" => "app-pass",
          "EMAIL_FROM_ADDRESS" => "noreply@example.com"
        )
      )
      allow(EmailDelivery).to receive(:deliver).and_return("<uuid@gmail.com>")

      expect(described_class.send_reset(password_reset, password_reset.token)).to be(true)
      expect(EmailDelivery).to have_received(:deliver) do |resolved, **kwargs|
        expect(resolved.provider).to eq("gmail")
        expect(kwargs[:to]).to eq(["user-reset@example.com"])
      end
    end

    it "skips delivery without any credentials" do
      stub_const("ENV", ENV.to_h.except("RESEND_API_KEY", "GMAIL_APP_PASSWORD"))
      sender = class_double("Resend::Emails").as_stubbed_const
      allow(sender).to receive(:send)

      expect(described_class.send_reset(password_reset, password_reset.token)).to be(false)
      expect(sender).not_to have_received(:send)
    end

    it "swallows provider errors" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
      sender = class_double("Resend::Emails").as_stubbed_const
      allow(sender).to receive(:send).and_raise(StandardError, "boom")

      expect(described_class.send_reset(password_reset, password_reset.token)).to be(false)
    end
  end
end
