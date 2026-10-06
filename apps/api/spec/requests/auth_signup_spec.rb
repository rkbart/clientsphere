require "rails_helper"

RSpec.describe "Signup", type: :request do
  describe "POST /api/v1/auth/signup" do
    it "creates a user, workspace and owner membership in one go" do
      post "/api/v1/auth/signup",
           params: {
             user: { name: "Founder", email: "founder@example.com", password: "password123" },
             account_name: "Acme Inc",
           }, as: :json

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["token"]).to be_present
      expect(body["account"]["name"]).to eq("Acme Inc")

      user = User.find_by(email: "founder@example.com")
      expect(user).to be_present
      expect(user.role_for(Account.find(body["account"]["id"]))).to eq("owner")
      expect(user.current_account_id).to eq(body["account"]["id"])
      expect(user.welcome_seen_at).to be_present
    end

    it "rejects a duplicate email without creating a stray workspace" do
      User.create!(name: "Old", email: "taken@example.com", password: "password123")

      expect do
        post "/api/v1/auth/signup",
             params: {
               user: { name: "New", email: "taken@example.com", password: "password123" },
               account_name: "Stray Workspace",
             }, as: :json
      end.not_to change(Account, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "rejects a missing workspace name without creating a stray user" do
      expect do
        post "/api/v1/auth/signup",
             params: {
               user: { name: "Nope", email: "noworkspace@example.com", password: "password123" },
               account_name: "",
             }, as: :json
      end.not_to change(User, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
