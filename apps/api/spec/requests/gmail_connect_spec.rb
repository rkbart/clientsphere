require "rails_helper"

RSpec.describe "Gmail connect", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-gc@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:google_connect] = OmniAuth::AuthHash.new(
      provider: "google_connect",
      uid: "google-uid-1",
      info: { email: "company@gmail.com", name: "Company" },
      credentials: { refresh_token: "refresh-abc", token: "access-abc", expires: true }
    )
  end

  after do
    OmniAuth.config.test_mode = false
    OmniAuth.config.mock_auth[:google_connect] = nil
  end

  def connect_token_for(user: owner, account_id: account.id)
    post "/api/v1/email_settings/gmail_connect_token", headers: headers
    JSON.parse(response.body)["connect_token"]
  end

  it "mints a connect token for owners" do
    post "/api/v1/email_settings/gmail_connect_token", headers: headers

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["connect_token"]).to be_present
  end

  it "refuses to mint a token when Google OAuth is unconfigured" do
    stub_const("ENV", ENV.to_h.merge("GOOGLE_CLIENT_ID" => nil, "GOOGLE_CLIENT_SECRET" => nil))

    post "/api/v1/email_settings/gmail_connect_token", headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)["error"]).to match(/not configured/)
  end

  it "stores the workspace grant on callback" do
    token = connect_token_for
    get "/auth/google_connect", params: { connect_token: token }
    get "/auth/google_connect/callback"

    expect(response).to have_http_status(:found)
    expect(response.location).to include("/settings/email?gmail_connected=1")

    setting = account.reload.email_setting
    expect(setting.gmail_address).to eq("company@gmail.com")
    expect(setting.gmail_refresh_token).to eq("refresh-abc")
    expect(setting.gmail_grant_revoked).to be(false)
  end

  it "sends as the connected address for any member" do
    account.email_setting || account.build_email_setting
    account.email_setting.update!(
      provider: "gmail", gmail_refresh_token: "refresh-abc", gmail_address: "company@gmail.com"
    )
    contact = account.contacts.create!(first_name: "Jane", email: "jane-gc@example.com")
    allow(GmailApi).to receive(:access_token).with("refresh-abc").and_return("access-abc")
    allow(GmailApi).to receive(:send_email).and_return("gmail-msg-1")

    resolved = EmailDelivery.for_account(account)

    expect(resolved.provider).to eq("gmail_api")
    expect(resolved.from).to eq("company@gmail.com")

    email = EmailService.send_email(account: account, contact: contact, subject: "Hi", body: "Hello")

    expect(email.status).to eq("sent")
    expect(email.provider_message_id).to eq("gmail-msg-1")
    expect(email.message_id).to match(/@gmail\.com/)
  end

  it "flags the grant revoked when Google rejects it" do
    account.email_setting || account.build_email_setting
    account.email_setting.update!(
      provider: "gmail", gmail_refresh_token: "dead-token", gmail_address: "company@gmail.com"
    )
    contact = account.contacts.create!(first_name: "Jane", email: "jane-gc2@example.com")
    allow(GmailApi).to receive(:access_token).and_raise(GmailApi::AuthError, "revoked")

    email = EmailService.send_email(account: account, contact: contact, subject: "Hi", body: "Hello")

    expect(email.status).to eq("failed")
    expect(account.email_setting.reload.gmail_grant_revoked).to be(true)
    # Revoked grants stop resolving to the API (SMTP/Resend fallback or draft)
    expect(EmailDelivery.for_account(account).provider).not_to eq("gmail_api")
  end

  it "rejects tampered connect tokens at the request phase" do
    get "/auth/google_connect", params: { connect_token: "bogus" }

    expect(response).to have_http_status(:found)
    expect(response.location).to include("/settings/email?gmail_error=")
  end

  it "disconnects the grant" do
    account.create_email_setting!(
      provider: "gmail", gmail_refresh_token: "refresh-abc", gmail_address: "company@gmail.com"
    )

    post "/api/v1/email_settings/gmail_disconnect", headers: headers

    expect(response).to have_http_status(:ok)
    setting = account.reload.email_setting
    expect(setting.gmail_refresh_token).to be_nil
    expect(JSON.parse(response.body)["gmail_connected"]).to be(false)
  end
end
