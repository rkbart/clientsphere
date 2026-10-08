require "rails_helper"

RSpec.describe "Addresses", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-addr@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }
  let(:billing) do
    { "street" => "123 Main St", "city" => "Berlin", "state" => "BE", "postal_code" => "10115", "country" => "Germany" }
  end

  it "saves structured billing/shipping on contacts" do
    post "/api/v1/contacts",
         params: {
           contact: {
             first_name: "Ada", email: "ada-addr@example.com",
             billing_address: billing, shipping_address: { "city" => "Munich" }
           }
         },
         headers: headers

    expect(response).to have_http_status(:created)
    body = JSON.parse(response.body)
    expect(body["billing_address"]).to include("street" => "123 Main St", "city" => "Berlin")
    expect(body["shipping_address"]).to eq("city" => "Munich")
  end

  it "saves structured billing/shipping on companies" do
    post "/api/v1/companies",
         params: { company: { name: "Acme Corp", billing_address: billing, shipping_address: billing } },
         headers: headers

    expect(response).to have_http_status(:created)
    body = JSON.parse(response.body)
    expect(body["billing_address"]).to include("country" => "Germany")
    expect(body["shipping_address"]).to include("country" => "Germany")
  end

  it "strips unknown address keys instead of rejecting" do
    post "/api/v1/contacts",
         params: { contact: { first_name: "Ada", billing_address: { "planet" => "Mars", "city" => "Berlin" } } },
         headers: headers

    expect(response).to have_http_status(:created)
    expect(JSON.parse(response.body)["billing_address"]).to eq("city" => "Berlin")
  end
end
