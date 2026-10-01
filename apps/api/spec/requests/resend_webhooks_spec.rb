require "rails_helper"

RSpec.describe "Resend webhooks", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:raw_key) { SecureRandom.random_bytes(32) }
  let(:secret) { "whsec_#{Base64.strict_encode64(raw_key)}" }

  before do
    account.create_email_setting!(resend_api_key: "re_xxx", webhook_secret: secret)
  end

  def signed_post(payload, key: raw_key, timestamp: Time.current.to_i, account_id: account.id)
    body = JSON.generate(payload)
    id = "msg_#{SecureRandom.hex(8)}"
    sig = Base64.strict_encode64(OpenSSL::HMAC.digest("SHA256", key, "#{id}.#{timestamp}.#{body}"))
    post "/api/v1/webhooks/resend/#{account_id}",
         params: body,
         headers: {
           "CONTENT_TYPE" => "application/json",
           "webhook-id" => id,
           "webhook-timestamp" => timestamp.to_s,
           "webhook-signature" => "v1,#{sig}"
         }
  end

  def event(type, message_id)
    { "type" => type, "data" => { "email_id" => message_id } }
  end

  let!(:email) do
    account.emails.create!(
      direction: :outbound, from_address: "me@example.com",
      to_addresses: ["you@example.com"], subject: "Hi", body: "Hello",
      status: :sent, provider_message_id: "re_msg_123"
    )
  end

  it "marks delivered and opened with timestamps" do
    signed_post(event("email.delivered", "re_msg_123"))
    expect(response).to have_http_status(:ok)
    expect(email.reload.status).to eq("delivered")

    signed_post(event("email.opened", "re_msg_123"))
    expect(email.reload.status).to eq("opened")
    expect(email.reload.opened_at).to be_present
  end

  it "marks bounced as failed" do
    signed_post(event("email.bounced", "re_msg_123"))
    expect(email.reload.status).to eq("failed")
  end

  it "never regresses status on replayed or out-of-order events" do
    signed_post(event("email.opened", "re_msg_123"))
    expect(email.reload.status).to eq("opened")

    signed_post(event("email.delivered", "re_msg_123"))
    expect(email.reload.status).to eq("opened")
  end

  it "ignores unknown message ids and event types" do
    signed_post(event("email.delivered", "re_nope"))
    expect(response).to have_http_status(:ok)

    signed_post(event("email.complained", "re_msg_123"))
    expect(response).to have_http_status(:ok)
    expect(email.reload.status).to eq("sent")
  end

  it "rejects bad signatures and stale timestamps" do
    signed_post(event("email.delivered", "re_msg_123"), key: SecureRandom.random_bytes(32))
    expect(response).to have_http_status(:unauthorized)

    signed_post(event("email.delivered", "re_msg_123"), timestamp: 1.hour.ago.to_i)
    expect(response).to have_http_status(:unauthorized)
    expect(email.reload.status).to eq("sent")
  end

  it "ignores emails from other accounts" do
    other = Account.create!(name: "Other")
    other_email = other.emails.create!(
      direction: :outbound, from_address: "me@example.com",
      to_addresses: ["x@example.com"], subject: "Hi", body: "Hello",
      status: :sent, provider_message_id: "re_msg_other"
    )

    signed_post(event("email.delivered", "re_msg_other"))
    expect(response).to have_http_status(:ok)
    expect(other_email.reload.status).to eq("sent")
  end

  it "404s without a configured secret or unknown account" do
    account.email_setting.update!(webhook_secret: nil)
    signed_post(event("email.delivered", "re_msg_123"))
    expect(response).to have_http_status(:not_found)

    signed_post(event("email.delivered", "re_msg_123"), account_id: SecureRandom.uuid)
    expect(response).to have_http_status(:not_found)
  end
end
