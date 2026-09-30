require "rails_helper"

RSpec.describe "Invitations", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:session) { Session.create!(user: owner) }
  let(:headers) { { "Authorization" => "Bearer #{session.token}" } }

  describe "POST /api/v1/invitations" do
    it "creates an invitation and returns the raw token once" do
      post "/api/v1/invitations",
           params: { invitation: { email: "new@example.com", role: "member" } },
           headers: headers, as: :json

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["token"]).to be_present
      expect(body).not_to have_key("token_digest")
    end

    it "defaults expiry to ~7 days" do
      post "/api/v1/invitations",
           params: { invitation: { email: "new2@example.com", role: "viewer" } },
           headers: headers, as: :json

      invitation = Invitation.find_by(email: "new2@example.com")
      expect(invitation.expires_at).to be_within(1.minute).of(7.days.from_now)
    end
  end

  describe "POST /api/v1/invitations/:token/accept" do
    it "accepts a valid invitation and returns a session token" do
      post "/api/v1/invitations",
           params: { invitation: { email: "joiner@example.com", role: "member" } },
           headers: headers, as: :json
      token = JSON.parse(response.body)["token"]

      post "/api/v1/invitations/#{token}/accept",
           params: { email: "joiner@example.com" }, as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["token"]).to be_present
      expect(Membership.find_by(account: account, user: User.find_by(email: "joiner@example.com"))&.role)
        .to eq("member")
    end

    it "rejects a forged token" do
      post "/api/v1/invitations/bogus/accept", params: { email: "x@example.com" }, as: :json

      expect(response).to have_http_status(:not_found)
    end
  end
end
