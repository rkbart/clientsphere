require "rails_helper"

RSpec.describe "Workspaces", type: :request do
  let(:owner) do
    User.create!(name: "Owner", email: "owner-ws@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:account) { Account.create!(name: "Acme") }
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  describe "GET /api/v1/accounts" do
    it "lists only the caller's workspaces" do
      other = Account.create!(name: "Other")
      member = User.create!(name: "M", email: "m-ws@example.com", password: "password123")
      Membership.create!(account: other, user: member, role: :member)

      get "/api/v1/accounts", headers: headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).map { |a| a["name"] }).to eq(["Acme"])
    end
  end

  describe "POST /api/v1/accounts" do
    it "creates a workspace with the caller as owner and switches to it" do
      post "/api/v1/accounts", params: { account: { name: "  Side Quest  " } }, headers: headers, as: :json

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["name"]).to eq("Side Quest")

      created = Account.find(body["id"])
      expect(owner.role_for(created)).to eq("owner")
      expect(owner.reload.current_account).to eq(created)
    end

    it "rejects a blank name without side effects" do
      headers # materialize the owner/account lets before the count window
      expect do
        post "/api/v1/accounts", params: { account: { name: "  " } }, headers: headers, as: :json
      end.not_to change(Account, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /api/v1/accounts/:id" do
    it "renames a workspace the caller belongs to" do
      patch "/api/v1/accounts/#{account.id}", params: { name: "Acme Renamed" }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(account.reload.name).to eq("Acme Renamed")
    end

    it "404s on a workspace the caller is not a member of" do
      stranger_account = Account.create!(name: "Stranger")

      patch "/api/v1/accounts/#{stranger_account.id}", params: { name: "Hijacked" }, headers: headers, as: :json

      expect(response).to have_http_status(:not_found)
      expect(stranger_account.reload.name).to eq("Stranger")
    end
  end

  describe "DELETE /api/v1/accounts/:id" do
    it "deletes an extra workspace and lands the deleter on the survivor" do
      post "/api/v1/accounts", params: { account: { name: "Extra" } }, headers: headers, as: :json
      extra_id = JSON.parse(response.body)["id"]

      delete "/api/v1/accounts/#{extra_id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(Account.exists?(extra_id)).to be(false)
      expect(owner.reload.current_account).to eq(account)
      expect(JSON.parse(response.body)["account"]["id"]).to eq(account.id)
    end

    it "refuses to delete the last remaining workspace" do
      delete "/api/v1/accounts/#{account.id}", headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(Account.exists?(account.id)).to be(true)
    end

    it "forbids non-owners from deleting" do
      viewer = User.create!(name: "V", email: "v-ws@example.com", password: "password123")
      Membership.create!(account: account, user: viewer, role: :viewer)
      viewer.update!(current_account: account)
      viewer_headers = { "Authorization" => "Bearer #{Session.create!(user: viewer).token}" }

      other = Account.create!(name: "Other")
      Membership.create!(account: other, user: viewer, role: :viewer)

      delete "/api/v1/accounts/#{account.id}", headers: viewer_headers

      expect(response).to have_http_status(:forbidden)
      expect(Account.exists?(account.id)).to be(true)
    end

    it "locks out members left behind on a deleted workspace" do
      extra = Account.create!(name: "Doomed")
      Membership.create!(account: extra, user: owner, role: :owner)
      member_user = User.create!(name: "Left", email: "left-ws@example.com", password: "password123")
      Membership.create!(account: extra, user: member_user, role: :member)
      member_user.update!(current_account: extra)
      member_session = Session.create!(user: member_user)

      owner.update!(current_account: extra)
      delete "/api/v1/accounts/#{extra.id}", headers: headers

      expect(response).to have_http_status(:ok)
      get "/api/v1/contacts", headers: { "Authorization" => "Bearer #{member_session.token}" }
      expect(response).to have_http_status(:unauthorized)
      post "/api/v1/auth/login", params: { email: member_user.email, password: "password123" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
