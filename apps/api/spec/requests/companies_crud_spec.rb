require "rails_helper"

RSpec.describe "Companies CRUD", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:other_account) { Account.create!(name: "Other") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-co@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  def create_company(attrs = {})
    account.companies.create!({ name: "Acme Corp" }.merge(attrs))
  end

  it "soft deletes a company and hides it from the index" do
    company = create_company

    delete "/api/v1/companies/#{company.id}", headers: headers

    expect(response).to have_http_status(:no_content)
    expect(company.reload.discarded_at).to be_present

    get "/api/v1/companies", headers: headers
    expect(JSON.parse(response.body)["data"].map { |c| c["id"] }).not_to include(company.id)
  end

  it "returns 404 for a discarded company" do
    company = create_company
    company.discard!

    get "/api/v1/companies/#{company.id}", headers: headers
    expect(response).to have_http_status(:not_found)

    delete "/api/v1/companies/#{company.id}", headers: headers
    expect(response).to have_http_status(:not_found)
  end

  it "404s on a discarded company's tags endpoint" do
    company = create_company
    company.discard!

    get "/api/v1/companies/#{company.id}/tags", headers: headers
    expect(response).to have_http_status(:not_found)
  end

  it "does not leak another account's company" do
    foreign = other_account.companies.create!(name: "Foreign Co")

    get "/api/v1/companies/#{foreign.id}", headers: headers
    expect(response).to have_http_status(:not_found)
  end

  it "sorts by name asc/desc with allow-listed columns only" do
    create_company(name: "Zeta")
    create_company(name: "Alpha")

    get "/api/v1/companies", params: { sort: "name", direction: "asc" }, headers: headers
    expect(JSON.parse(response.body)["data"].map { |c| c["name"] }).to eq(["Alpha", "Zeta"])

    get "/api/v1/companies", params: { sort: "name", direction: "desc" }, headers: headers
    expect(JSON.parse(response.body)["data"].map { |c| c["name"] }).to eq(["Zeta", "Alpha"])

    get "/api/v1/companies", params: { sort: "password_digest", direction: "asc" }, headers: headers
    expect(response).to have_http_status(:ok)
  end

  it "searches name, domain and industry" do
    create_company(name: "Beacon", domain: "beacon.io")
    create_company(name: "Cascade", industry: "Logistics")

    get "/api/v1/companies", params: { q: "beacon.io" }, headers: headers
    expect(JSON.parse(response.body)["data"].map { |c| c["name"] }).to eq(["Beacon"])

    get "/api/v1/companies", params: { q: "Logistics" }, headers: headers
    expect(JSON.parse(response.body)["data"].map { |c| c["name"] }).to eq(["Cascade"])
  end

  it "saves address, employees, social links, main contact and records added_by" do
    contact = account.contacts.create!(first_name: "Ada", email: "ada-co@example.com")

    post "/api/v1/companies",
         params: {
           company: {
             name: "Acme Corp",
             address: "123 Main St, Berlin",
             main_contact_id: contact.id,
             social_links: [{ platform: "linkedin", url: "https://linkedin.com/company/acme" }]
           }
         },
         headers: headers

    expect(response).to have_http_status(:created)
    body = JSON.parse(response.body)
    expect(body["address"]).to eq("123 Main St, Berlin")
    expect(body["main_contact_id"]).to eq(contact.id)
    expect(body["added_by_id"]).to eq(owner.id)
    expect(body["social_links"]).to eq([
      { "platform" => "linkedin", "url" => "https://linkedin.com/company/acme" }
    ])
  end

  it "rejects a main contact from another account" do
    outsider = other_account.contacts.create!(first_name: "Eve", email: "eve-other@example.com")

    post "/api/v1/companies",
         params: { company: { name: "Acme Corp", main_contact_id: outsider.id } },
         headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "rejects social links with unknown platform or bad URL" do
    post "/api/v1/companies",
         params: {
           company: {
             name: "Acme Corp",
             social_links: [{ platform: "myspace", url: "not-a-url" }]
           }
         },
         headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "paginates with meta and includes tags" do
    tag = Tag.create!(account: account, name: "vip", color: "#22c55e")
    company = create_company(name: "First")
    Tagging.create!(account: account, tag: tag, taggable: company)
    2.times { |i| create_company(name: "C#{i}") }

    get "/api/v1/companies", params: { per_page: 2, page: 1, sort: "name" }, headers: headers
    body = JSON.parse(response.body)

    expect(body["data"].length).to eq(2)
    expect(body["meta"]["total_count"]).to eq(3)
    expect(body["meta"]["total_pages"]).to eq(2)
    expect(body["meta"]["current_page"]).to eq(1)

    get "/api/v1/companies", params: { per_page: 2, page: 2, sort: "name" }, headers: headers
    tagged = JSON.parse(response.body)["data"].find { |c| c["id"] == company.id }
    expect(tagged["tags"].map { |t| t["name"] }).to eq(["vip"])
  end
end
