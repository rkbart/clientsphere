require "rails_helper"

RSpec.describe "Emails inbox", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-ei@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  def create_inbound(attrs = {})
    account.emails.create!({
      direction: :inbound,
      from_address: "jane@example.com",
      to_addresses: ["me@example.com"],
      subject: "Re: Hello",
      body: "Thanks!",
      status: :delivered
    }.merge(attrs))
  end

  it "counts unread inbound mail for the badge" do
    create_inbound
    create_inbound(subject: "Second", provider_message_id: "m2")
    create_inbound(subject: "Read one", provider_message_id: "m3", read_at: Time.current)
    account.emails.create!(
      direction: :outbound, from_address: "me@example.com",
      to_addresses: ["jane@example.com"], subject: "Hi", body: "Hello", status: :sent
    )
    account.emails.create!(
      direction: :outbound, from_address: "me@example.com",
      to_addresses: ["jane@example.com"], subject: "Draft", body: "Hello", status: :draft
    )
    account.emails.create!(
      direction: :outbound, from_address: "me@example.com",
      to_addresses: ["jane@example.com"], subject: "Failed", body: "Hello", status: :failed
    )

    get "/api/v1/emails/unread_count", headers: headers

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["unread_count"]).to eq(2)
    expect(body["failed_count"]).to eq(1)
    expect(body["draft_count"]).to eq(1)
  end

  it "does not count another account's mail" do
    other = Account.create!(name: "Other")
    other.emails.create!(
      direction: :inbound, from_address: "bob@example.com",
      to_addresses: ["other@example.com"], subject: "Hi", body: "Hello", status: :delivered
    )

    get "/api/v1/emails/unread_count", headers: headers

    expect(JSON.parse(response.body)["unread_count"]).to eq(0)
  end

  it "marks an inbound email read" do
    email = create_inbound

    post "/api/v1/emails/#{email.id}/mark_read", headers: headers

    expect(response).to have_http_status(:ok)
    expect(email.reload.read_at).to be_present

    get "/api/v1/emails/unread_count", headers: headers
    expect(JSON.parse(response.body)["unread_count"]).to eq(0)
  end

  it "filters the index by direction and unread" do
    create_inbound
    account.emails.create!(
      direction: :outbound, from_address: "me@example.com",
      to_addresses: ["jane@example.com"], subject: "Hi", body: "Hello", status: :sent
    )

    get "/api/v1/emails", params: { direction: "inbound", unread: "true" }, headers: headers

    body = JSON.parse(response.body)
    expect(body["data"].length).to eq(1)
    expect(body["data"].first["direction"]).to eq("inbound")
  end

  it "filters the index to read inbound mail" do
    create_inbound
    create_inbound(subject: "Read one", provider_message_id: "m9", read_at: Time.current)

    get "/api/v1/emails", params: { direction: "inbound", unread: "false" }, headers: headers

    body = JSON.parse(response.body)
    expect(body["data"].length).to eq(1)
    expect(body["data"].first["subject"]).to eq("Read one")
  end
end
