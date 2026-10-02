require "rails_helper"

RSpec.describe "Email templates", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-et@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }
  let(:company) { account.companies.create!(name: "Acme Corp") }
  let(:contact) do
    account.contacts.create!(first_name: "Ada", last_name: "Lovelace", email: "ada-et@example.com", company: company)
  end

  it "returns the template catalog with placeholders" do
    get "/api/v1/emails/templates", headers: headers

    expect(response).to have_http_status(:ok)
    templates = JSON.parse(response.body)
    expect(templates).not_to be_empty
    templates.each do |t|
      expect(t.keys).to include("key", "name", "subject", "body")
    end
    expect(templates.map { |t| t["key"] }).to include("follow_up", "introduction", "proposal", "check_in")
  end

  it "interpolates placeholders for the given contact" do
    get "/api/v1/emails/templates", params: { contact_id: contact.id }, headers: headers

    template = JSON.parse(response.body).find { |t| t["key"] == "follow_up" }
    expect(template["body"]).to include("Ada")
    expect(template["body"]).not_to include("{{first_name}}")
  end

  it "requires authentication" do
    get "/api/v1/emails/templates"

    expect(response).to have_http_status(:unauthorized)
  end

  it "delivers an email for the contact (draft without provider key)" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => nil))

    post "/api/v1/emails/deliver",
         params: { contact_id: contact.id, subject: "Hi", body: "Hello Ada" },
         headers: headers

    expect(response).to have_http_status(:created)
    body = JSON.parse(response.body)
    expect(body["status"]).to eq("draft")
    expect(body["to_addresses"]).to eq(["ada-et@example.com"])
  end

  it "marks sent when Resend delivers" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "x" })

    post "/api/v1/emails/deliver",
         params: { contact_id: contact.id, subject: "Hi", body: "Hello Ada" },
         headers: headers

    expect(response).to have_http_status(:created)
    expect(JSON.parse(response.body)["status"]).to eq("sent")
  end

  it "rejects a contact from another account" do
    other = Account.create!(name: "Other")
    outsider = other.contacts.create!(first_name: "Eve", email: "eve-other@example.com")

    post "/api/v1/emails/deliver",
         params: { contact_id: outsider.id, subject: "Hi", body: "Hello" },
         headers: headers

    expect(response).to have_http_status(:not_found)
  end

  it "rejects a blank subject" do
    post "/api/v1/emails/deliver",
         params: { contact_id: contact.id, subject: "", body: "Hello" },
         headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
  end
end
