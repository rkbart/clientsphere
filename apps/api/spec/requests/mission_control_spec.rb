require "rails_helper"

RSpec.describe "Mission Control dashboard", type: :request do
  it "is closed by default (requires HTTP basic auth)" do
    get "/jobs"

    expect(response).to have_http_status(:unauthorized)
  end
end
