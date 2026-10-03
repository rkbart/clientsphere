require "rails_helper"

RSpec.describe "Activities bulk complete", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-bulk@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:viewer) do
    User.create!(name: "Viewer", email: "viewer-bulk@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :viewer)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  def create_task(attrs = {})
    account.activities.create!({ creator: owner, kind: :task, subject: "Bulk me" }.merge(attrs))
  end

  it "completes several tasks at once" do
    ids = Array.new(3) { create_task.id }

    post "/api/v1/activities/bulk_complete",
         params: { activity_ids: ids }, headers: headers

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["completed"]).to match_array(ids)
    expect(body["failed"]).to be_empty
    expect(account.activities.where(id: ids).where.not(completed_at: nil).count).to eq(3)
  end

  it "reports unknown ids as failed instead of dropping them" do
    id = create_task.id

    post "/api/v1/activities/bulk_complete",
         params: { activity_ids: [id, "00000000-0000-0000-0000-000000000000"] }, headers: headers

    body = JSON.parse(response.body)
    expect(body["completed"]).to contain_exactly(id)
    expect(body["failed"].map { |f| f["error"] }).to all(eq("Not found"))
  end

  it "ignores ids from other accounts" do
    other = Account.create!(name: "Other")
    foreign = other.activities.create!(creator: owner, kind: :task, subject: "Foreign")

    post "/api/v1/activities/bulk_complete",
         params: { activity_ids: [foreign.id] }, headers: headers

    body = JSON.parse(response.body)
    expect(body["completed"]).to be_empty
    expect(foreign.reload.completed_at).to be_nil
  end

  it "rejects viewers and empty lists" do
    viewer_headers = { "Authorization" => "Bearer #{Session.create!(user: viewer).token}" }

    post "/api/v1/activities/bulk_complete",
         params: { activity_ids: [create_task.id] }, headers: viewer_headers
    expect(response).to have_http_status(:forbidden)

    post "/api/v1/activities/bulk_complete",
         params: { activity_ids: [] }, headers: headers
    expect(response).to have_http_status(:unprocessable_entity)
  end
end
