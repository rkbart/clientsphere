require "rails_helper"

RSpec.describe "Custom field values", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-cf@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:session) { Session.create!(user: owner) }
  let(:headers) { { "Authorization" => "Bearer #{session.token}" } }

  before do
    account.custom_field_definitions.create!(entity_type: "Contact", key: "plan", label: "Plan",
                                             field_type: :select, options: { "choices" => %w[free pro] })
    account.custom_field_definitions.create!(entity_type: "Contact", key: "seat_count", label: "Seats",
                                             field_type: :number)
    account.custom_field_definitions.create!(entity_type: "Contact", key: "nickname", label: "Nickname",
                                             field_type: :text, required: true)
  end

  def create_contact(custom_data)
    post "/api/v1/contacts",
         params: { contact: { first_name: "Ada", custom_data: custom_data } },
         headers: headers, as: :json
  end

  it "creates select definitions with choices through the API" do
    post "/api/v1/custom_field_definitions",
         params: {
           custom_field_definition: {
             entity_type: "Contact", key: "tier", label: "Tier",
             field_type: "select", options: { choices: %w[bronze silver] },
           },
         },
         headers: headers, as: :json

    expect(response).to have_http_status(:created)
    definition = account.custom_field_definitions.find_by(key: "tier")
    expect(definition.options["choices"]).to eq(%w[bronze silver])
  end

  it "rejects select definitions without choices" do
    post "/api/v1/custom_field_definitions",
         params: {
           custom_field_definition: {
             entity_type: "Contact", key: "tier2", label: "Tier 2", field_type: "select",
           },
         },
         headers: headers, as: :json

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "accepts valid custom values" do
    create_contact({ "plan" => "pro", "seat_count" => 5, "nickname" => "Addy" })

    expect(response).to have_http_status(:created)
    expect(JSON.parse(response.body)["custom_data"]).to include("plan" => "pro", "nickname" => "Addy")
  end

  it "rejects unknown fields" do
    create_contact({ "nickname" => "Addy", "bogus" => "x" })

    expect(response).to have_http_status(:unprocessable_entity)
    expect(response.body).to match(/unknown field: bogus/)
  end

  it "rejects wrong types and bad select options" do
    create_contact({ "nickname" => "Addy", "seat_count" => "lots", "plan" => "enterprise" })

    expect(response).to have_http_status(:unprocessable_entity)
    expect(response.body).to match(/must be a number/)
    expect(response.body).to match(/must be one of/)
  end

  it "enforces required fields" do
    create_contact({ "plan" => "free" })

    expect(response).to have_http_status(:unprocessable_entity)
    expect(response.body).to match(/Nickname is required/)
  end

  it "filters index by custom values" do
    create_contact({ "plan" => "pro", "nickname" => "Addy" })
    create_contact({ "plan" => "free", "nickname" => "Bea" })

    get "/api/v1/contacts?custom[plan]=pro", headers: headers

    names = JSON.parse(response.body)["data"].map { |c| c["first_name"] }
    expect(names).to eq(["Ada"])
    expect(JSON.parse(response.body)["meta"]["total_count"]).to eq(1)
  end

  it "ignores filters for unknown fields" do
    create_contact({ "plan" => "pro", "nickname" => "Addy" })

    get "/api/v1/contacts?custom[nope]=x", headers: headers

    expect(JSON.parse(response.body)["meta"]["total_count"]).to eq(1)
  end
end
