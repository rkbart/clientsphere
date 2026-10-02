require "rails_helper"

RSpec.describe EmailService do
  let(:account) { Account.create!(name: "Acme") }
  let(:contact) { account.contacts.create!(first_name: "John", email: "john-es@example.com") }

  it "keeps a draft when Resend is not configured" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => nil))

    email = described_class.send_email(account: account, contact: contact, subject: "Hi", body: "Hello")

    expect(email.status).to eq("draft")
  end

  it "passes a positional params hash to Resend and marks sent" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test", "EMAIL_FROM_ADDRESS" => "me@example.com"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "x" })

    email = described_class.send_email(account: account, contact: contact, subject: "Hi", body: "Hello")

    expect(sender).to have_received(:send).with(
      hash_including(from: "me@example.com", to: ["john-es@example.com"], subject: "Hi", html: "Hello")
    )
    expect(email.reload.status).to eq("sent")
  end

  it "prefers the account setting over ENV and stores the provider id" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_env", "EMAIL_FROM_ADDRESS" => "env@example.com"))
    account.create_email_setting!(resend_api_key: "re_account", from_address: "me@example.com")
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "re_abc" })

    email = described_class.send_email(account: account, contact: contact, subject: "Hi", body: "Hello")

    expect(sender).to have_received(:send).with(hash_including(from: "me@example.com"))
    expect(email.reload.provider_message_id).to eq("re_abc")
  end

  it "marks failed when Resend raises" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_raise(StandardError, "boom")

    email = described_class.send_email(account: account, contact: contact, subject: "Hi", body: "Hello")

    expect(email.reload.status).to eq("failed")
  end
end
