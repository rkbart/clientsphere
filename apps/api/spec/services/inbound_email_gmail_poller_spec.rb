require "rails_helper"

RSpec.describe InboundEmail::GmailPoller do
  let(:account) { Account.create!(name: "Acme") }

  before do
    account.create_email_setting!(
      provider: "gmail", from_address: "me@gmail.com", smtp_password: "app-pass"
    )
  end

  let(:raw_reply) do
    <<~RAW
      From: Jane <jane@example.com>
      To: me@gmail.com
      Subject: Re: Hello
      Message-ID: <reply-1@example.com>
      In-Reply-To: <out-1@example.com>
      Content-Type: text/plain; charset=UTF-8

      Sounds good, let's talk.
    RAW
  end

  def stub_imap(raws)
    imap = double("imap")
    allow(imap).to receive(:select).with("INBOX")
    allow(imap).to receive(:login).with("me@gmail.com", "app-pass")
    allow(imap).to receive(:search).with(["UNSEEN"]).and_return(raws.keys)
    raws.each do |uid, raw|
      fetch = double("fetch", attr: { "RFC822" => raw })
      allow(imap).to receive(:fetch).with(uid, "RFC822").and_return([fetch])
      allow(imap).to receive(:store).with(uid, "+FLAGS", [:Seen])
    end
    allow(imap).to receive(:logout)
    allow(imap).to receive(:disconnect)
    allow(Net::IMAP).to receive(:new).with("imap.gmail.com", 993, true).and_return(imap)
    imap
  end

  it "ingests unseen replies and marks them seen" do
    contact = account.contacts.create!(first_name: "Jane", email: "jane@example.com")
    imap = stub_imap(101 => raw_reply)

    expect(described_class.call(account)).to eq(1)

    email = account.emails.inbound.first
    expect(email.contact).to eq(contact)
    expect(email.subject).to eq("Re: Hello")
    expect(email.body).to include("Sounds good")
    expect(email.provider_message_id).to eq("gmail:reply-1@example.com")
    expect(email.message_id).to eq("reply-1@example.com")
    expect(imap).to have_received(:store).with(101, "+FLAGS", [:Seen])
  end

  it "threads onto the outbound message by RFC id" do
    deal = account.deals.create!(
      title: "Big deal", pipeline: account.pipelines.create!(name: "Sales", is_default: true),
      stage: account.pipelines.first.stages.first
    )
    account.emails.create!(
      direction: :outbound, from_address: "me@gmail.com", to_addresses: ["jane@example.com"],
      subject: "Hello", body: "Hi", status: :sent,
      provider_message_id: "<uuid@gmail.com>", message_id: "<out-1@example.com>", deal: deal
    )
    stub_imap(101 => raw_reply)

    described_class.call(account)

    email = account.emails.inbound.first
    expect(email.thread_key).to eq("<uuid@gmail.com>")
    expect(email.deal).to eq(deal)
  end

  it "skips accounts without Gmail credentials and survives IMAP errors" do
    account.email_setting.update!(smtp_password: nil)
    expect(described_class.call(account)).to eq(0)

    account.email_setting.update!(smtp_password: "app-pass")
    allow(Net::IMAP).to receive(:new).and_raise(Errno::ECONNREFUSED)
    expect(described_class.call(account)).to eq(0)
    expect(account.emails.inbound.count).to eq(0)
  end
end
