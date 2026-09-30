require "rails_helper"

RSpec.describe "OAuth callbacks", type: :request do
  it "bounces to login when Google sends no credentials" do
    get "/auth/google_oauth2/callback"

    expect(response).to have_http_status(:redirect)
    # OmniAuth intercepts the empty callback as csrf_detected before our
    # controller sees it — either way the user lands on login with an error.
    expect(response.location).to include("/login?oauth_error=")
  end

  it "bounces to login when OmniAuth flags a failure" do
    get "/auth/failure", params: { message: "csrf_detected", strategy: "google_oauth2" }

    expect(response).to have_http_status(:redirect)
    expect(response.location).to include("/login?oauth_error=csrf_detected")
  end

  it "bounces to login on provider failure" do
    get "/auth/failure", params: { message: "access_denied" }

    expect(response).to have_http_status(:redirect)
    expect(response.location).to include("/login?oauth_error=access_denied")
  end
end
