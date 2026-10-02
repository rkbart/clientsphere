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

  before do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "msg_1" })
  end

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

    it "allows re-inviting an email whose invitation was already accepted" do
      post "/api/v1/invitations",
           params: { invitation: { email: "accepted@example.com", role: "member" } },
           headers: headers, as: :json
      token = JSON.parse(response.body)["token"]
      post "/api/v1/invitations/#{token}/accept", as: :json
      expect(response).to have_http_status(:ok)

      post "/api/v1/invitations",
           params: { invitation: { email: "accepted@example.com", role: "member" } },
           headers: headers, as: :json

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["token"]).to be_present
    end

    it "reissues when a pending invitation already exists" do
      post "/api/v1/invitations",
           params: { invitation: { email: "again@example.com", role: "member" } },
           headers: headers, as: :json
      first = JSON.parse(response.body)

      post "/api/v1/invitations",
           params: { invitation: { email: "again@example.com", role: "viewer" } },
           headers: headers, as: :json

      expect(response).to have_http_status(:created)
      second = JSON.parse(response.body)
      expect(second["id"]).not_to eq(first["id"])
      expect(second["token"]).not_to eq(first["token"])
      expect(Invitation.where(account: account, email: "again@example.com", accepted_at: nil).count).to eq(1)
      expect(Invitation.exists?(first["id"])).to be(false)
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

    it "pins the invitee to the workspace so data is visible" do
      account.contacts.create!(first_name: "Ada", last_name: "Lovelace", email: "ada@example.com")

      post "/api/v1/invitations",
           params: { invitation: { email: "land@example.com", role: "member" } },
           headers: headers, as: :json
      token = JSON.parse(response.body)["token"]

      post "/api/v1/invitations/#{token}/accept", as: :json
      expect(response).to have_http_status(:ok)
      session_token = JSON.parse(response.body)["token"]

      get "/api/v1/contacts", headers: { "Authorization" => "Bearer #{session_token}" }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"].map { |c| c["email"] }).to include("ada@example.com")
    end

    it "rejects double accept gracefully" do
      post "/api/v1/invitations",
           params: { invitation: { email: "twice@example.com", role: "member" } },
           headers: headers, as: :json
      token = JSON.parse(response.body)["token"]
      post "/api/v1/invitations/#{token}/accept", as: :json
      expect(response).to have_http_status(:ok)

      post "/api/v1/invitations/#{token}/accept", as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "GET /api/v1/invitations" do
    it "lists pending invitations for managers" do
      post "/api/v1/invitations",
           params: { invitation: { email: "wait@example.com", role: "member" } },
           headers: headers, as: :json

      get "/api/v1/invitations", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.map { |i| i["email"] }).to eq(["wait@example.com"])
      expect(body.first).not_to have_key("token_digest")
    end
  end

  describe "DELETE /api/v1/invitations/:id" do
    it "revokes a pending invitation" do
      invitation = account.invitations.create!(email: "gone@example.com", role: :member, invited_by: owner)

      delete "/api/v1/invitations/#{invitation.id}", headers: headers

      expect(response).to have_http_status(:no_content)
      expect(Invitation.find_by(id: invitation.id)).to be_nil
    end
  end
end
