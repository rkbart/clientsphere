require "rails_helper"

RSpec.describe Invitations::Notifier do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) { User.create!(name: "Owner", email: "owner-notify@example.com", password: "password123") }
  let(:invitation) do
    Invitation.create!(account: account, invited_by: owner, email: "join-notify@example.com", role: :member)
  end

  describe ".send_invite" do
    it "passes a single positional hash to Resend" do
      stub_const(
        "ENV",
        ENV.to_h.merge("RESEND_API_KEY" => "re_test", "EMAIL_FROM_ADDRESS" => "noreply@example.com")
      )
      sender = class_double("Resend::Emails").as_stubbed_const
      allow(sender).to receive(:send).and_return({ id: "msg_1" })

      expect(described_class.send_invite(invitation, "raw-token")).to be(true)
      expect(sender).to have_received(:send) do |params|
        expect(params).to be_a(Hash)
        expect(params[:to]).to eq(["join-notify@example.com"])
        expect(params[:subject]).to include("Acme")
        expect(params[:html]).to include("/accept-invite/raw-token")
      end
    end

    it "skips delivery without an API key" do
      stub_const("ENV", ENV.to_h.except("RESEND_API_KEY"))
      sender = class_double("Resend::Emails").as_stubbed_const
      allow(sender).to receive(:send)

      expect(described_class.send_invite(invitation, "raw-token")).to be(false)
      expect(sender).not_to have_received(:send)
    end

    it "swallows provider errors" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
      sender = class_double("Resend::Emails").as_stubbed_const
      allow(sender).to receive(:send).and_raise(StandardError, "boom")

      expect(described_class.send_invite(invitation, "raw-token")).to be(false)
    end

    it "fails fast when the provider hangs" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
      sender = class_double("Resend::Emails").as_stubbed_const
      allow(sender).to receive(:send).and_raise(Timeout::Error)

      expect(described_class.send_invite(invitation, "raw-token")).to be(false)
    end

    it "caps delivery with a configurable timeout" do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test",
                                       "INVITE_DELIVERY_TIMEOUT_SECONDS" => "1"))
      sender = class_double("Resend::Emails").as_stubbed_const
      allow(sender).to receive(:send) { sleep 5 }

      started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      expect(described_class.send_invite(invitation, "raw-token")).to be(false)
      elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started
      expect(elapsed).to be < 3
    end
  end

  describe ".invite_link" do
    it "builds an accept link with the escaped email" do
      link = described_class.invite_link(invitation, "raw-token")

      expect(link).to include("/accept-invite/raw-token?email=join-notify%40example.com")
    end
  end
end
