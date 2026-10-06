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

    it "updates the contact phone" do
      patch "/api/v1/users/me", params: { phone: "  +1 555 010 2030  " }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["phone"]).to eq("+1 555 010 2030")
    end

    it "clears the contact phone when blank" do
      user.update!(phone: "+1 555 010 2030")

      patch "/api/v1/users/me", params: { phone: "   " }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["phone"]).to be_nil
    end

    it "never changes the email (invitation identity)" do
      patch "/api/v1/users/me", params: { email: "hacker@example.com" }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["email"]).to eq("me@example.com")
      expect(user.reload.email).to eq("me@example.com")
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

    describe "workspace rename (fresh Google signups)" do
      it "renames the auto-created solo workspace and echoes the new name" do
        solo = Account.create!(name: "Old's workspace")
        g_user = User.create!(name: "Old", email: "g-rename@example.com", password: "password123").tap do |u|
          Membership.create!(account: solo, user: u, role: :owner)
          u.update!(current_account: solo)
        end
        g_headers = { "Authorization" => "Bearer #{Session.create!(user: g_user).token}" }

        patch "/api/v1/users/me", params: { account_name: "  Acme Inc  " }, headers: g_headers, as: :json

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)["account_name"]).to eq("Acme Inc")
        expect(solo.reload.name).to eq("Acme Inc")
      end

      it "ignores the rename on a shared workspace (teammates must not rename)" do
        teammate = User.create!(name: "Mate", email: "mate@example.com", password: "password123")
        Membership.create!(account: account, user: teammate, role: :member)

        patch "/api/v1/users/me", params: { account_name: "Hijacked" }, headers: headers, as: :json

        expect(response).to have_http_status(:ok)
        expect(account.reload.name).to eq("Acme")
      end

      it "ignores the rename for non-owners" do
        member_user = User.create!(name: "Viewer", email: "viewer@example.com", password: "password123")
        Membership.create!(account: account, user: member_user, role: :viewer)
        member_user.update!(current_account: account)
        member_headers = { "Authorization" => "Bearer #{Session.create!(user: member_user).token}" }

        patch "/api/v1/users/me", params: { account_name: "Hijacked" }, headers: member_headers, as: :json

        expect(response).to have_http_status(:ok)
        expect(account.reload.name).to eq("Acme")
      end
    end
  end
end
