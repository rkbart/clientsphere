require "rails_helper"

RSpec.describe "Emails outbox", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-eo@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }
  let(:contact) { account.contacts.create!(first_name: "Ada", email: "ada-eo@example.com") }

  def create_email(attrs = {})
    account.emails.create!({
      contact: contact,
      direction: :outbound,
      from_address: "me@example.com",
      to_addresses: ["ada-eo@example.com"],
      subject: "Hi",
      body: "Hello",
      status: :draft
    }.merge(attrs))
  end

  it "filters the index by status" do
    create_email(status: :draft)
    create_email(status: :sent, subject: "Sent one")

    get "/api/v1/emails", params: { status: "draft" }, headers: headers

    body = JSON.parse(response.body)
    expect(body["data"].length).to eq(1)
    expect(body["data"].first["status"]).to eq("draft")
  end

  it "redelivers a draft through the provider" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "x" })
    email = create_email(status: :draft)

    post "/api/v1/emails/#{email.id}/redeliver", headers: headers

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["status"]).to eq("sent")
    expect(email.reload.sent_at).to be_present
  end

  it "refuses to redeliver an email with no recipient" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "x" })
    email = create_email(to_addresses: [])

    post "/api/v1/emails/#{email.id}/redeliver", headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)["error"]).to include("no recipient")
    expect(sender).not_to have_received(:send)
    expect(email.reload.status).to eq("draft")
  end

  it "marks failed when redelivery raises" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_raise(StandardError, "boom")
    email = create_email(status: :failed)

    post "/api/v1/emails/#{email.id}/redeliver", headers: headers

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["status"]).to eq("failed")
  end

  it "leaves the email untouched without a provider key" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => nil))
    email = create_email(status: :draft)

    post "/api/v1/emails/#{email.id}/redeliver", headers: headers

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["status"]).to eq("draft")
  end

  it "delivers to custom to/cc/bcc addresses" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "x" })

    post "/api/v1/emails/deliver",
         params: {
           contact_id: contact.id,
           subject: "Hi",
           body: "Hello",
           to_addresses: ["boss@example.com"],
           cc_addresses: ["cc@example.com"],
           bcc_addresses: ["bcc@example.com"]
         },
         headers: headers

    expect(sender).to have_received(:send).with(
      hash_including(
        to: ["boss@example.com"],
        cc: ["cc@example.com"],
        bcc: ["bcc@example.com"]
      )
    )
    body = JSON.parse(response.body)
    expect(body["to_addresses"]).to eq(["boss@example.com"])
    expect(body["cc_addresses"]).to eq(["cc@example.com"])
    expect(body["bcc_addresses"]).to eq(["bcc@example.com"])
  end

  it "updates a draft's recipients, subject and body" do
    email = create_email(status: :draft)

    patch "/api/v1/emails/#{email.id}",
          params: {
            email: {
              to_addresses: ["new@example.com"],
              cc_addresses: ["cc@example.com"],
              subject: "New subject",
              body: "New body"
            }
          },
          headers: headers

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["to_addresses"]).to eq(["new@example.com"])
    expect(body["cc_addresses"]).to eq(["cc@example.com"])
    expect(body["subject"]).to eq("New subject")
  end

  it "404s for another account's email" do
    other = Account.create!(name: "Other")
    outsider = other.emails.create!(
      direction: :outbound, from_address: "me@example.com",
      to_addresses: ["x@example.com"], subject: "Hi", body: "Hello", status: :draft
    )

    post "/api/v1/emails/#{outsider.id}/redeliver", headers: headers

    expect(response).to have_http_status(:not_found)
  end

  it "lets an owner delete a draft or failed email" do
    draft = create_email(status: :draft)
    failed = create_email(status: :failed, subject: "Failed one")

    delete "/api/v1/emails/#{draft.id}", headers: headers
    expect(response).to have_http_status(:no_content)

    delete "/api/v1/emails/#{failed.id}", headers: headers
    expect(response).to have_http_status(:no_content)

    expect(account.emails.where(id: [draft.id, failed.id]).count).to eq(0)
  end

  it "404s deleting another account's email" do
    other = Account.create!(name: "Other")
    outsider = other.emails.create!(
      direction: :outbound, from_address: "me@example.com",
      to_addresses: ["x@example.com"], subject: "Hi", body: "Hello", status: :draft
    )

    delete "/api/v1/emails/#{outsider.id}", headers: headers

    expect(response).to have_http_status(:not_found)
  end
end
