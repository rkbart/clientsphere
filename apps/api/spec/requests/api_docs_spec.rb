require "rails_helper"

RSpec.describe "API docs", type: :request do
  it "serves the Swagger UI" do
    get "/api-docs/index.html"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include("swagger")
  end

  it "serves a valid generated OpenAPI document" do
    get "/api-docs/v1/swagger.yaml"

    expect(response).to have_http_status(:ok)
    doc = YAML.safe_load(response.body)
    expect(doc["openapi"]).to start_with("3.")
    paths = doc["paths"]
    expect(paths).to include("/api/v1/contacts", "/api/v1/auth/login", "/api/v1/api_tokens")

    # Public endpoints carry no auth requirement.
    login = paths["/api/v1/auth/login"]["post"]
    expect(login["security"]).to be_nil

    # Everything else requires a bearer token.
    expect(paths["/api/v1/contacts"]["get"]["security"]).to eq([{ "bearerAuth" => [] }])
  end
end
