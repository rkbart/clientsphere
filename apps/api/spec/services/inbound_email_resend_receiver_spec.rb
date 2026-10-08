require "rails_helper"

RSpec.describe InboundEmail::ResendReceiver do
  let(:account) { Account.create!(name: "Acme") }

  before do
    account.create_email_setting!(
      resend_api_key: "re_xxx", from_address: "me@example.com",
      inbound_address: "acct-123@inbound.example.com"
    )
  end

  let(:retrieved) do
    {
      "from" => "Jane <jane@example.com>",
      "to" => ["acct-123@inbound.example.com"],
      "subject" => "Re: Hello",
      "text" => "Thanks!",
      "html" => "<p>Thanks!</p>",
      "message_id" => "<abc@example.com>",
      "headers" => {}
    }
  end

  def ingest_received(data = {})
    allow(Resend::Emails::Receiving).to receive(:get).and_return(retrieved)
    described_class.call(
      account: account,
      event_data: { "email_id" => "rcv-1", "to" => ["acct-123@inbound.example.com"] }.merge(data)
    )
  end

  it "stores the inbound reply and links the contact" do
    contact = account.contacts.create!(first_name: "Jane", email: "jane@example.com")

    result = ingest_received

    expect(result.created).to be(true)
    email = result.email
    expect(email.direction).to eq("inbound")
    expect(email.contact).to eq(contact)
    expect(email.body).to eq("Thanks!")
    expect(email.provider_message_id).to eq("resend:rcv-1")
    expect(email.read_at).to be_nil
    expect(Resend::Emails::Receiving).to have_received(:get).with("rcv-1")
  end

  it "returns nil without fetching when the event has no email id" do
    allow(Resend::Emails::Receiving).to receive(:get)

    expect(ingest_received("email_id" => nil)).to be_nil
    expect(Resend::Emails::Receiving).not_to have_received(:get)
  end

  it "returns nil when no Resend key is configured" do
    account.email_setting.update!(resend_api_key: nil)
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => nil))
    allow(Resend::Emails::Receiving).to receive(:get)

    expect(ingest_received).to be_nil
    expect(Resend::Emails::Receiving).not_to have_received(:get)
  end
end
