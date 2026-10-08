require "rails_helper"

RSpec.describe InboundEmail::Ingest do
  include ActiveJob::TestHelper

  let(:account) { Account.create!(name: "Acme") }
  let!(:owner) do
    User.create!(name: "Owner", email: "owner-inbound@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end

  def ingest(**attrs)
    described_class.call(
      **{ account: account, from: "jane@example.com", subject: "Re: Hello",
          provider: "resend", provider_message_id: "msg-1" }.merge(attrs)
    )
  end

  it "creates an inbound email linked to the sending contact" do
    contact = account.contacts.create!(first_name: "Jane", email: "jane@example.com")

    result = ingest

    expect(result.created).to be(true)
    email = result.email
    expect(email.direction).to eq("inbound")
    expect(email.status).to eq("delivered")
    expect(email.contact).to eq(contact)
    expect(email.read_at).to be_nil
    expect(email.thread_key).to eq("msg-1")
  end

  it "threads a reply onto the parent thread and deal" do
    pipeline = account.pipelines.create!(name: "Sales", is_default: true)
    deal = account.deals.create!(title: "Big deal", pipeline: pipeline, stage: pipeline.stages.first)
    parent = account.emails.create!(
      direction: :outbound, subject: "Hello", body: "Hi",
      to_addresses: ["jane@example.com"], status: :sent,
      provider_message_id: "parent-1", thread_key: "parent-1", deal: deal
    )

    result = ingest(in_reply_to: "parent-1", provider_message_id: "msg-2")

    expect(result.email.thread_key).to eq("parent-1")
    expect(result.email.deal).to eq(deal)
    expect(parent.reload.thread_key).to eq("parent-1")
  end

  it "extracts the bare address from a display name" do
    contact = account.contacts.create!(first_name: "Jane", email: "jane@example.com")

    result = ingest(from: "Jane Doe <jane@example.com>")

    expect(result.created).to be(true)
    expect(result.email.from_address).to eq("jane@example.com")
    expect(result.email.contact).to eq(contact)
  end

  it "is idempotent on provider_message_id" do    first = ingest
    second = ingest(subject: "Changed")

    expect(second.created).to be(false)
    expect(second.email.id).to eq(first.email.id)
    expect(account.emails.count).to eq(1)
  end

  it "skips mail from the workspace's own sender address" do
    account.create_email_setting!(from_address: "me@example.com", resend_api_key: "re_x")

    result = ingest(from: "me@example.com")

    expect(result.created).to be(false)
    expect(result.email).to be_nil
    expect(account.emails.count).to eq(0)
  end

  it "fires the email_received automation for new mail only" do
    account.automations.create!(
      name: "Reply follow-up", trigger_type: :email_received, is_active: true,
      actions: [{ "type" => "create_task", "subject" => "Reply to inbound email" }]
    )

    perform_enqueued_jobs { ingest }
    expect(account.activities.where(subject: "Reply to inbound email").count).to eq(1)

    perform_enqueued_jobs { ingest }
    expect(account.activities.where(subject: "Reply to inbound email").count).to eq(1)
  end
end
