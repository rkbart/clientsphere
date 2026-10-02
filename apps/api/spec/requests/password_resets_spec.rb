require "rails_helper"

RSpec.describe "Password resets", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:user) do
    User.create!(name: "Pat", email: "pat@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end

  before do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "msg_1" })
  end

  def resets_for(email)
    PasswordReset.joins(:user).where(users: { email: email })
  end

  describe "POST /api/v1/password_resets" do
    it "emails a reset link" do
      post "/api/v1/password_resets", params: { email: user.email }, as: :json

      expect(response).to have_http_status(:created)
      expect(user.password_resets.count).to eq(1)
    end

    it "never reveals whether an email exists" do
      post "/api/v1/password_resets", params: { email: "nobody@example.com" }, as: :json

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["message"]).to be_present
      expect(resets_for("nobody@example.com")).to be_empty
    end

    it "supersedes an outstanding reset" do
      post "/api/v1/password_resets", params: { email: user.email }, as: :json
      first = user.password_resets.last

      post "/api/v1/password_resets", params: { email: user.email }, as: :json

      expect(first.reload.used_at).to be_present
      expect(user.password_resets.usable.count).to eq(1)
    end
  end

  describe "PATCH /api/v1/password_resets/:password_reset_id/update" do
    # Built through the model because the raw token is only readable at
    # creation time (only the digest is persisted).
    let(:raw_token) { user.password_resets.create!.token }

    it "sets a new password and invalidates existing sessions" do
      session = Session.create!(user: user)
      token = raw_token

      patch "/api/v1/password_resets/#{token}/update",
            params: { password: "brandnew123", password_confirmation: "brandnew123" }, as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.authenticate("brandnew123")).to be_truthy
      expect(Session.exists?(session.id)).to be(false)
    end

    it "allows logging in with the new password" do
      token = raw_token
      patch "/api/v1/password_resets/#{token}/update",
            params: { password: "brandnew123", password_confirmation: "brandnew123" }, as: :json

      post "/api/v1/auth/login", params: { email: user.email, password: "brandnew123" }, as: :json
      expect(response).to have_http_status(:ok)
    end

    it "clears the first-login prompt so the modal does not reappear" do
      user.update_columns(welcome_seen_at: nil)
      token = raw_token

      patch "/api/v1/password_resets/#{token}/update",
            params: { password: "brandnew123", password_confirmation: "brandnew123" }, as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.welcome_seen_at).to be_present
    end

    it "leaves the first-login prompt alone when the reset fails" do
      user.update_columns(welcome_seen_at: nil)
      token = raw_token

      patch "/api/v1/password_resets/#{token}/update",
            params: { password: "brandnew123", password_confirmation: "mismatched123" }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(user.reload.welcome_seen_at).to be_nil
    end

    it "rejects a mismatched confirmation" do
      token = raw_token

      patch "/api/v1/password_resets/#{token}/update",
            params: { password: "brandnew123", password_confirmation: "different123" }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(user.reload.authenticate("password123")).to be_truthy
    end

    it "rejects a forged token" do
      patch "/api/v1/password_resets/bogus/update",
            params: { password: "brandnew123", password_confirmation: "brandnew123" }, as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "rejects reuse of a spent token" do
      token = raw_token
      patch "/api/v1/password_resets/#{token}/update",
            params: { password: "brandnew123", password_confirmation: "brandnew123" }, as: :json
      expect(response).to have_http_status(:ok)

      patch "/api/v1/password_resets/#{token}/update",
            params: { password: "another12345", password_confirmation: "another12345" }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "rejects an expired token" do
      password_reset = user.password_resets.create!
      password_reset.update!(expires_at: 1.hour.ago)
      token = password_reset.token

      patch "/api/v1/password_resets/#{token}/update",
            params: { password: "brandnew123", password_confirmation: "brandnew123" }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
