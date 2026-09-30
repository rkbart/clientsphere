require "rails_helper"

RSpec.describe "Activities date filters", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-cal@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  before do
    account.activities.create!(creator: owner, kind: :meeting, subject: "Past",
                               due_at: 10.days.ago)
    account.activities.create!(creator: owner, kind: :call, subject: "Soon",
                               due_at: 2.days.from_now)
    account.activities.create!(creator: owner, kind: :task, subject: "Later",
                               due_at: 20.days.from_now)
    account.activities.create!(creator: owner, kind: :task, subject: "Undated")
  end

  it "filters by due range for the calendar" do
    get "/api/v1/activities?due_from=#{5.days.ago.to_date}&due_to=#{5.days.from_now.to_date}",
        headers: headers

    subjects = JSON.parse(response.body)["data"].map { |a| a["subject"] }
    expect(subjects).to contain_exactly("Soon")
  end
end
