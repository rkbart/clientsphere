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
    get "/api/v1/email_settings", headers: headers

    body = JSON.parse(response.body)
    expect(body["from_address"]).to be_nil
    expect(body["resend_api_key_set"]).to be(false)
    expect(body["webhook_secret_set"]).to be(false)
    expect(body.keys).not_to include("resend_api_key", "webhook_secret")
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
