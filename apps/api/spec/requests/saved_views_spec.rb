require "rails_helper"

RSpec.describe "Saved views", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-sv@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:session) { Session.create!(user: owner) }
  let(:headers) { { "Authorization" => "Bearer #{session.token}" } }

  it "creates a view with filter/sort/column hashes through the API" do
    post "/api/v1/saved_views",
         params: {
           saved_view: {
             entity_type: "Contact", name: "Hot leads", shared: true,
             filters: { status: "lead", tag_id: "abc" }, sort: { by: "created_at" }, columns: { show: %w[name email] },
           },
         },
         headers: headers, as: :json

    expect(response).to have_http_status(:created)
    view = account.saved_views.find_by(name: "Hot leads")
    expect(view.filters).to include("status" => "lead", "tag_id" => "abc")
    expect(view.shared).to be(true)
  end

  it "lists views scoped to entity type" do
    account.saved_views.create!(user: owner, entity_type: "Contact", name: "C1")
    account.saved_views.create!(user: owner, entity_type: "Deal", name: "D1")

    get "/api/v1/saved_views?entity_type=Contact", headers: headers

    names = JSON.parse(response.body).map { |v| v["name"] }
    expect(names).to eq(["C1"])
  end

  it "requires login" do
    get "/api/v1/saved_views"

    expect(response).to have_http_status(:unauthorized)
  end

  it "shows viewers only shared views and their own" do
    viewer = User.create!(name: "Viewer", email: "viewer-sv@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :viewer)
      u.update!(current_account: account)
    end
    viewer_headers = { "Authorization" => "Bearer #{Session.create!(user: viewer).token}" }
    account.saved_views.create!(user: owner, entity_type: "Contact", name: "Shared", shared: true)
    account.saved_views.create!(user: owner, entity_type: "Contact", name: "Private")
    account.saved_views.create!(user: viewer, entity_type: "Contact", name: "Mine")

    get "/api/v1/saved_views?entity_type=Contact", headers: viewer_headers

    names = JSON.parse(response.body).map { |v| v["name"] }.sort
    expect(names).to eq(%w[Mine Shared])
  end
end
