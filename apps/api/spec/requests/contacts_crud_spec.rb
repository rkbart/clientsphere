require "rails_helper"

RSpec.describe "Contacts CRUD", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-crud@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  def create_contact(attrs = {})
    account.contacts.create!({ first_name: "Ada", last_name: "Lovelace", email: "ada@example.com" }.merge(attrs))
  end

  it "soft deletes a contact and hides it from the index" do
    contact = create_contact

    delete "/api/v1/contacts/#{contact.id}", headers: headers

    expect(response).to have_http_status(:no_content)
    expect(contact.reload.discarded_at).to be_present

    get "/api/v1/contacts", headers: headers
    body = JSON.parse(response.body)
    expect(body["data"].map { |c| c["id"] }).not_to include(contact.id)
  end

  it "returns 404 for a discarded contact" do
    contact = create_contact
    contact.discard!

    get "/api/v1/contacts/#{contact.id}", headers: headers

    expect(response).to have_http_status(:not_found)
  end

  it "404s on a discarded contact's tags endpoint" do
    contact = create_contact
    contact.discard!

    get "/api/v1/contacts/#{contact.id}/tags", headers: headers

    expect(response).to have_http_status(:not_found)
  end

  it "sorts by company name with asc/desc" do
    zeta = Company.create!(account: account, name: "Zeta")
    alpha = Company.create!(account: account, name: "Alpha")
    create_contact(first_name: "Zed", email: "zed@example.com", company: zeta)
    create_contact(first_name: "Al", email: "al@example.com", company: alpha)
    create_contact(first_name: "NoCo", email: "noco@example.com")

    get "/api/v1/contacts", params: { sort: "company", direction: "asc" }, headers: headers
    asc = JSON.parse(response.body)["data"].map { |c| c["company"] && c["company"]["name"] }
    expect(asc.compact).to eq(["Alpha", "Zeta"])

    get "/api/v1/contacts", params: { sort: "company", direction: "desc" }, headers: headers
    desc = JSON.parse(response.body)["data"].map { |c| c["company"] && c["company"]["name"] }
    expect(desc.compact).to eq(["Zeta", "Alpha"])
  end

  it "ignores unknown sort columns" do
    create_contact

    get "/api/v1/contacts", params: { sort: "password_digest", direction: "asc" }, headers: headers

    expect(response).to have_http_status(:ok)
  end

  it "paginates with meta" do
    3.times { |i| create_contact(first_name: "C#{i}", email: "c#{i}@example.com") }

    get "/api/v1/contacts", params: { per_page: 2, page: 1 }, headers: headers
    body = JSON.parse(response.body)

    expect(body["data"].length).to eq(2)
    expect(body["meta"]["total_count"]).to eq(3)
    expect(body["meta"]["total_pages"]).to eq(2)
    expect(body["meta"]["current_page"]).to eq(1)
  end

  it "allows reusing the email of a discarded contact" do
    contact = create_contact
    contact.discard!

    post "/api/v1/contacts",
         params: { contact: { first_name: "Ada", last_name: "Lovelace", email: "ada@example.com" } },
         headers: headers

    expect(response).to have_http_status(:created)
    expect(JSON.parse(response.body)["email"]).to eq("ada@example.com")
  end

  it "still rejects a duplicate email for a kept contact" do
    create_contact

    post "/api/v1/contacts",
         params: { contact: { first_name: "Ada", last_name: "Lovelace", email: "ada@example.com" } },
         headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "includes company and tags in the index payload" do
    tag = Tag.create!(account: account, name: "wholesale", color: "#22c55e")
    company = Company.create!(account: account, name: "Acme Corp")
    contact = create_contact(company: company)
    Tagging.create!(account: account, tag: tag, taggable: contact)

    get "/api/v1/contacts", headers: headers
    row = JSON.parse(response.body)["data"].first

    expect(row["company"]["name"]).to eq("Acme Corp")
    expect(row["tags"].map { |t| t["name"] }).to eq(["wholesale"])
  end
end
