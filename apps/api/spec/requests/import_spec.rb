require "rails_helper"

RSpec.describe "CSV import", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-imp@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  def upload(csv, mapping: nil, dedupe: nil)
    file = Tempfile.new(["import", ".csv"])
    file.write(csv)
    file.rewind
    uploaded = Rack::Test::UploadedFile.new(file.path, "text/csv")
    params = { file: uploaded }
    params[:mapping] = mapping.to_json if mapping
    params[:dedupe] = dedupe if dedupe
    post "/api/v1/import/csv", params: params, headers: headers
  ensure
    file.close
  end

  it "imports with exact headers and auto-matches aliases" do
    upload("First Name,Email Address,Phone\nAda,ada@example.com,555-0100\n")

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body).to include("imported" => 1, "skipped" => 0)
    expect(account.contacts.find_by(email: "ada@example.com").first_name).to eq("Ada")
  end

  it "applies an explicit column mapping" do
    upload("name,mail\nBea,bea@example.com\n",
           mapping: { "name" => "first_name", "mail" => "email" })

    expect(JSON.parse(response.body)["imported"]).to eq(1)
    expect(account.contacts.find_by(email: "bea@example.com").first_name).to eq("Bea")
  end

  it "skips duplicates by email by default" do
    account.contacts.create!(first_name: "Existing", email: "dup@example.com")
    upload("first_name,email\nNew,dup@example.com\n")

    body = JSON.parse(response.body)
    expect(body).to include("imported" => 0, "skipped" => 1)
    expect(account.contacts.find_by(email: "dup@example.com").first_name).to eq("Existing")
  end

  it "updates duplicates in update mode without blanking fields" do
    account.contacts.create!(first_name: "Existing", last_name: "Keep", email: "dup2@example.com")
    upload("first_name,email\nNew,dup2@example.com\n", dedupe: "update")

    body = JSON.parse(response.body)
    expect(body).to include("updated" => 1)
    contact = account.contacts.find_by(email: "dup2@example.com")
    expect(contact.first_name).to eq("New")
    expect(contact.last_name).to eq("Keep")
  end

  it "reports row errors without failing the batch" do
    upload("first_name,email\n,good@example.com\nOk,ok@example.com\n")

    body = JSON.parse(response.body)
    expect(body).to include("imported" => 1)
    expect(body["errors"].size).to eq(1)
    expect(body["errors"].first["row"]).to eq(2)
  end

  it "rejects invalid mapping JSON" do
    file = Tempfile.new(["import", ".csv"])
    file.write("first_name\nX\n")
    file.rewind
    post "/api/v1/import/csv",
         params: { file: Rack::Test::UploadedFile.new(file.path, "text/csv"), mapping: "{bad" },
         headers: headers
    file.close

    expect(response).to have_http_status(:unprocessable_entity)
  end
end
