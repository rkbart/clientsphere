require "rails_helper"

RSpec.describe "Google OAuth flow", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-oauth@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "g-123",
      info: { email: "new-google@example.com", name: "New Google" },
    })
  end

  after do
    OmniAuth.config.test_mode = false
    OmniAuth.config.mock_auth[:google_oauth2] = nil
  end

  it "creates a new user and redirects with a session token" do
    get "/auth/google_oauth2/callback"

    expect(response).to have_http_status(:redirect)
    expect(response.location).to include("/auth/google/callback?token=")
    expect(User.find_by(email: "new-google@example.com")).to be_present
  end

  it "links an existing user by email" do
    existing = User.create!(name: "Existing", email: "existing-google@example.com", password: SecureRandom.hex(16))
    Membership.create!(account: account, user: existing, role: :member)

    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "g-456",
      info: { email: "existing-google@example.com", name: "Existing" },
    })

    get "/auth/google_oauth2/callback"

    expect(response).to have_http_status(:redirect)
    expect(existing.reload.google_uid).to eq("g-456")
  end

  it "finds returning users by uid" do
    first = User.create!(name: "First", email: "first-google@example.com", password: SecureRandom.hex(16), google_uid: "g-789")
    Membership.create!(account: account, user: first, role: :member)

    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "g-789",
      info: { email: "changed-google@example.com", name: "First" },
    })

    get "/auth/google_oauth2/callback"

    expect(response).to have_http_status(:redirect)
    expect(first.reload.email).to eq("changed-google@example.com")
  end

  it "redirects to login on failure" do
    OmniAuth.config.mock_auth[:google_oauth2] = :invalid_credentials

    get "/auth/google_oauth2/callback"

    expect(response).to have_http_status(:redirect)
    expect(response.location).to include("/login?oauth_error=")
  end
end
