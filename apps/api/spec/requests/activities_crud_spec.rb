require "rails_helper"

RSpec.describe "Activities CRUD", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-ac@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  def create_activity(attrs = {})
    account.activities.create!({ creator: owner, kind: :task, subject: "Follow up" }.merge(attrs))
  end

  it "shows an activity" do
    activity = create_activity

    get "/api/v1/activities/#{activity.id}", headers: headers

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["subject"]).to eq("Follow up")
  end

  it "updates an activity" do
    activity = create_activity

    patch "/api/v1/activities/#{activity.id}",
          params: { activity: { subject: "Updated", due_at: 3.days.from_now.iso8601 } },
          headers: headers

    expect(response).to have_http_status(:ok)
    expect(activity.reload.subject).to eq("Updated")
  end

  it "completes and reopens an activity" do
    activity = create_activity

    patch "/api/v1/activities/#{activity.id}",
          params: { activity: { completed_at: Time.current.iso8601 } },
          headers: headers
    expect(activity.reload.completed_at).to be_present

    patch "/api/v1/activities/#{activity.id}",
          params: { activity: { completed_at: nil } },
          headers: headers
    expect(activity.reload.completed_at).to be_nil
  end

  it "destroys an activity" do
    activity = create_activity

    delete "/api/v1/activities/#{activity.id}", headers: headers

    expect(response).to have_http_status(:no_content)
    expect(Activity.find_by(id: activity.id)).to be_nil
  end
end
