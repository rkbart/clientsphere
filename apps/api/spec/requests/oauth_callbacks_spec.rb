require "rails_helper"

RSpec.describe "OAuth callbacks", type: :request do
  it "bounces to login when Google sends no credentials" do
    post "/auth/google_oauth2/callback"

    expect(response).to have_http_status(:redirect)
    expect(response.location).to include("/login?oauth_error=missing")
  end

  it "bounces to login on provider failure" do
    get "/auth/failure", params: { message: "access_denied" }

    expect(response).to have_http_status(:redirect)
    expect(response.location).to include("/login?oauth_error=access_denied")
  end
end
