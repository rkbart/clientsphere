require "rails_helper"

RSpec.describe "API tokens", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-tok@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  it "creates a token and exposes the raw value once" do
    post "/api/v1/api_tokens",
         params: { api_token: { name: "zapier" } }, headers: headers, as: :json

    expect(response).to have_http_status(:created)
    body = JSON.parse(response.body)
    expect(body["token"]).to start_with("csk_")
    expect(body).not_to have_key("token_digest")
    expect(body["prefix"]).to eq(body["token"].first(12))
  end

  it "authenticates API requests with the token" do
    post "/api/v1/api_tokens",
         params: { api_token: { name: "script" } }, headers: headers, as: :json
    raw = JSON.parse(response.body)["token"]

    get "/api/v1/contacts", headers: { "Authorization" => "Bearer #{raw}" }

    expect(response).to have_http_status(:ok)
    expect(ApiToken.find_by(name: "script").last_used_at).to be_present
  end

  it "rejects expired tokens" do
    token = ApiToken.create!(account: account, user: owner, name: "old", expires_at: 1.hour.ago)

    get "/api/v1/contacts", headers: { "Authorization" => "Bearer #{token.token}" }

    expect(response).to have_http_status(:unauthorized)
  end

  it "rejects revoked tokens" do
    post "/api/v1/api_tokens",
         params: { api_token: { name: "temp" } }, headers: headers, as: :json
    body = JSON.parse(response.body)

    delete "/api/v1/api_tokens/#{ApiToken.find_by(name: 'temp').id}", headers: headers
    expect(response).to have_http_status(:no_content)

    get "/api/v1/contacts", headers: { "Authorization" => "Bearer #{body['token']}" }
    expect(response).to have_http_status(:unauthorized)
  end

  it "forbids members from managing tokens" do
    member = User.create!(name: "M", email: "m-tok@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :member)
      u.update!(current_account: account)
    end
    member_headers = { "Authorization" => "Bearer #{Session.create!(user: member).token}" }

    post "/api/v1/api_tokens", params: { api_token: { name: "x" } }, headers: member_headers, as: :json

    expect(response).to have_http_status(:forbidden)
  end
end
