require "rails_helper"

RSpec.describe "Current user", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:user) do
    User.create!(name: "Old", email: "me@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: user).token}" } }

  describe "PATCH /api/v1/users/me" do
    it "updates the name" do
      patch "/api/v1/users/me", params: { name: "  New Name  " }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["name"]).to eq("New Name")
    end

    it "marks the welcome banner as seen" do
      expect(user.welcome_seen_at).to be_nil

      patch "/api/v1/users/me", params: { welcome_seen: true }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["welcome_seen_at"]).to be_present
    end

    it "rejects a blank name" do
      patch "/api/v1/users/me", params: { name: "   " }, headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(user.reload.name).to eq("Old")
    end

    it "sets a password that can then be used to log in" do
      patch "/api/v1/users/me",
            params: { password: "supersecret1", password_confirmation: "supersecret1" },
            headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.authenticate("supersecret1")).to be_truthy

      post "/api/v1/auth/login", params: { email: user.email, password: "supersecret1" }, as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["token"]).to be_present
    end

    it "rejects a mismatched password confirmation" do
      patch "/api/v1/users/me",
            params: { password: "supersecret1", password_confirmation: "different1" },
            headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(user.reload.authenticate("supersecret1")).to be_falsey
    end
  end
end
