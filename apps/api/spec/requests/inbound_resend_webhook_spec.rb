require "rails_helper"

RSpec.describe "Resend inbound webhook", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:raw_key) { SecureRandom.random_bytes(32) }
  let(:secret) { "whsec_#{Base64.strict_encode64(raw_key)}" }

  before do
    account.create_email_setting!(
      resend_api_key: "re_xxx", from_address: "me@example.com",
      webhook_secret: secret, inbound_address: "acct-123@inbound.example.com"
    )
  end

  def signed_post(payload)
    body = JSON.generate(payload)
    id = "msg_#{SecureRandom.hex(8)}"
    timestamp = Time.current.to_i
    sig = Base64.strict_encode64(OpenSSL::HMAC.digest("SHA256", raw_key, "#{id}.#{timestamp}.#{body}"))
    post "/api/v1/webhooks/resend/#{account.id}",
         params: body,
         headers: {
           "CONTENT_TYPE" => "application/json",
           "svix-id" => id,
           "svix-timestamp" => timestamp.to_s,
           "svix-signature" => "v1,#{sig}"
         }
  end

  def received_event(to: ["acct-123@inbound.example.com"])
    { "type" => "email.received",
      "data" => { "email_id" => "rcv-9", "to" => to, "from" => "jane@example.com", "subject" => "Re: Hi" } }
  end

  before do
    allow(Resend::Emails::Receiving).to receive(:get).and_return(
      "from" => "jane@example.com",
      "to" => ["acct-123@inbound.example.com"],
      "subject" => "Re: Hi",
      "text" => "Sounds good",
      "message_id" => "<reply-9@example.com>",
      "headers" => {}
    )
  end

  it "ingests a reply mailed to the workspace inbound address" do
    contact = account.contacts.create!(first_name: "Jane", email: "jane@example.com")

    signed_post(received_event)

    expect(response).to have_http_status(:ok)
    email = account.emails.inbound.first
    expect(email.contact).to eq(contact)
    expect(email.body).to eq("Sounds good")
    expect(email.read_at).to be_nil
  end

  it "ignores mail to an address that is not the workspace inbound address" do
    signed_post(received_event(to: ["someone-else@inbound.example.com"]))

    expect(response).to have_http_status(:ok)
    expect(account.emails.inbound.count).to eq(0)
    expect(Resend::Emails::Receiving).not_to have_received(:get)
  end

  it "still rejects a bad signature" do
    body = JSON.generate(received_event)
    post "/api/v1/webhooks/resend/#{account.id}",
         params: body,
         headers: { "CONTENT_TYPE" => "application/json", "svix-signature" => "v1,bogus" }

    expect(response).to have_http_status(:unauthorized)
  end
end
