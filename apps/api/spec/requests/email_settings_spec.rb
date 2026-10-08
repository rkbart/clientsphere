require "rails_helper"

RSpec.describe "Email settings", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-es@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:viewer) do
    User.create!(name: "Viewer", email: "viewer-es@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :viewer)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }
  let(:viewer_headers) { { "Authorization" => "Bearer #{Session.create!(user: viewer).token}" } }

  it "returns empty settings when unconfigured" do
    stub_const("ENV", ENV.to_h.except("RESEND_API_KEY", "GMAIL_APP_PASSWORD"))

    get "/api/v1/email_settings", headers: headers

    body = JSON.parse(response.body)
    expect(body["from_address"]).to be_nil
    expect(body["delivery_configured"]).to be(false)
    expect(body["resend_api_key_set"]).to be(false)
    expect(body["webhook_secret_set"]).to be(false)
    expect(body.keys).not_to include("resend_api_key", "webhook_secret")
  end

  it "reports delivery configured from the global key alone" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_env"))

    get "/api/v1/email_settings", headers: headers

    body = JSON.parse(response.body)
    expect(body["delivery_configured"]).to be(true)
    # ...but the workspace itself is still unconfigured, which is what the
    # onboarding nudge keys off.
    expect(body["workspace_configured"]).to be(false)
  end

  it "reports delivery configured for a complete gmail setting" do
    account.create_email_setting!(provider: "gmail", from_address: "me@gmail.com", smtp_password: "app-pass")

    get "/api/v1/email_settings", headers: headers

    body = JSON.parse(response.body)
    expect(body["delivery_configured"]).to be(true)
    expect(body["workspace_configured"]).to be(true)
    expect(body["provider"]).to eq("gmail")
  end

  it "saves secrets without ever returning them" do
    patch "/api/v1/email_settings",
          params: {
            email_setting: {
              from_address: "me@example.com",
              resend_api_key: "re_xxx",
              webhook_secret: "whsec_yyy"
            }
          },
          headers: headers

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["from_address"]).to eq("me@example.com")
    expect(body["resend_api_key_set"]).to be(true)
    expect(body["webhook_secret_set"]).to be(true)
    expect(body["webhook_url"]).to include("/api/v1/webhooks/resend/#{account.id}")
    expect(body.keys).not_to include("resend_api_key", "webhook_secret")
  end

  it "preserves secrets when blank values are submitted" do
    account.create_email_setting!(resend_api_key: "re_keep", webhook_secret: "whsec_keep")

    patch "/api/v1/email_settings",
          params: { email_setting: { from_address: "me@example.com", resend_api_key: "", webhook_secret: "" } },
          headers: headers

    setting = account.reload.email_setting
    expect(setting.resend_api_key).to eq("re_keep")
    expect(setting.webhook_secret).to eq("whsec_keep")
    expect(setting.from_address).to eq("me@example.com")
  end

  it "saves a gmail provider with an app password without ever returning it" do
    patch "/api/v1/email_settings",
          params: {
            email_setting: {
              provider: "gmail",
              from_address: "me@gmail.com",
              smtp_password: "app-pass"
            }
          },
          headers: headers

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["provider"]).to eq("gmail")
    expect(body["smtp_password_set"]).to be(true)
    expect(body.keys).not_to include("smtp_password")

    setting = account.reload.email_setting
    expect(setting.provider).to eq("gmail")
    expect(setting.smtp_password).to eq("app-pass")
  end

  it "saves and returns the inbound address for reply routing" do
    patch "/api/v1/email_settings",
          params: { email_setting: { inbound_address: "acct-1@inbound.example.com" } },
          headers: headers

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["inbound_address"]).to eq("acct-1@inbound.example.com")
    expect(account.reload.email_setting.inbound_address).to eq("acct-1@inbound.example.com")
  end

  it "rejects an unknown provider" do
    patch "/api/v1/email_settings",
          params: { email_setting: { provider: "bogus" } },
          headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "forbids viewers" do
    get "/api/v1/email_settings", headers: viewer_headers
    expect(response).to have_http_status(:forbidden)

    patch "/api/v1/email_settings",
          params: { email_setting: { from_address: "x@example.com" } },
          headers: viewer_headers
    expect(response).to have_http_status(:forbidden)
  end

  it "requires authentication" do
    get "/api/v1/email_settings"
    expect(response).to have_http_status(:unauthorized)
  end
end
