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
  let(:pipeline) { account.pipelines.create!(name: "Sales") }
  let(:open_stage) { pipeline.stages.find_by(kind: :open) }
  let(:contactless_deal) do
    account.deals.create!(title: "Test Deal", pipeline: pipeline, stage: open_stage)
  end
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

  it "renders a template body's blank lines as paragraphs" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "x" })

    body = "Hi Test,\n\nJust checking in.\n\nBest regards,\nClientSphere"
    post "/api/v1/emails/deliver",
         params: { contact_id: contact.id, subject: "Hi", body: body },
         headers: headers

    expect(sender).to have_received(:send) do |params|
      expect(params[:html]).to eq(
        "<p>Hi Test,</p>\n<p>Just checking in.</p>\n<p>Best regards,<br>\nClientSphere</p>"
      )
      expect(params[:text]).to eq(body)
    end
  end

  it "escapes html in the body rather than rendering it" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "x" })

    post "/api/v1/emails/deliver",
         params: { contact_id: contact.id, subject: "Hi", body: "<script>alert(1)</script>" },
         headers: headers

    expect(sender).to have_received(:send) do |params|
      expect(params[:html]).not_to include("<script>")
      expect(params[:html]).to include("&lt;script&gt;")
    end
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

  it "delivers without a contact when recipient addresses are given" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => nil))
    deal = contactless_deal

    post "/api/v1/emails/deliver",
         params: { deal_id: deal.id, subject: "Hi", body: "Hello", to_addresses: ["new@example.com"] },
         headers: headers

    expect(response).to have_http_status(:created)
    body = JSON.parse(response.body)
    expect(body["contact_id"]).to be_nil
    expect(body["deal_id"]).to eq(deal.id)
    expect(body["to_addresses"]).to eq(["new@example.com"])
  end

  it "rejects a send with neither a contact nor recipients" do
    deal = contactless_deal

    post "/api/v1/emails/deliver",
         params: { deal_id: deal.id, subject: "Hi", body: "Hello" },
         headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)["error"]).to include("recipient")
  end
end
