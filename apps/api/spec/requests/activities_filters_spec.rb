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

  it "searches subject and description" do
    account.activities.create!(creator: owner, kind: :email, subject: "Unrelated",
                               description: "mentions Past meeting notes")

    get "/api/v1/activities", params: { q: "past" }, headers: headers

    subjects = JSON.parse(response.body)["data"].map { |a| a["subject"] }
    expect(subjects).to contain_exactly("Past", "Unrelated")
  end

  it "filters completed both ways" do
    account.activities.first.update!(completed_at: 1.day.ago)

    get "/api/v1/activities", params: { completed: "true", per_page: 100 }, headers: headers
    expect(JSON.parse(response.body)["data"].length).to eq(1)

    get "/api/v1/activities", params: { completed: "false", per_page: 100 }, headers: headers
    expect(JSON.parse(response.body)["data"].length).to eq(3)
  end

  it "filters overdue incomplete activities" do
    get "/api/v1/activities", params: { overdue: "true" }, headers: headers

    subjects = JSON.parse(response.body)["data"].map { |a| a["subject"] }
    expect(subjects).to contain_exactly("Past")
  end

  it "filters by deal_id combined with overdue" do
    pipeline = account.pipelines.create!(name: "P")
    stage = pipeline.stages.create!(name: "S", position: 1)
    deal = account.deals.create!(title: "Harborview", pipeline: pipeline, stage: stage)
    account.activities.create!(creator: owner, kind: :task, subject: "Deal overdue",
                               due_at: 2.days.ago, deal: deal)
    account.activities.create!(creator: owner, kind: :task, subject: "Other overdue",
                               due_at: 2.days.ago)

    get "/api/v1/activities", params: { deal_id: deal.id, kind: "task", overdue: "true" }, headers: headers

    subjects = JSON.parse(response.body)["data"].map { |a| a["subject"] }
    expect(subjects).to contain_exactly("Deal overdue")
  end

  it "includes the linked deal id and title" do
    pipeline = account.pipelines.create!(name: "P")
    stage = pipeline.stages.create!(name: "S", position: 1)
    deal = account.deals.create!(title: "Harborview", pipeline: pipeline, stage: stage)
    account.activities.create!(creator: owner, kind: :task, subject: "Deal task", deal: deal)

    get "/api/v1/activities", params: { per_page: 100 }, headers: headers

    rows = JSON.parse(response.body)["data"]
    expect(rows.find { |a| a["subject"] == "Deal task" }["deal"]).to eq({ "id" => deal.id, "title" => "Harborview" })
    expect(rows.find { |a| a["subject"] == "Undated" }["deal"]).to be_nil
  end

  it "sorts by allow-listed columns and ignores the rest" do
    get "/api/v1/activities", params: { sort: "subject", direction: "asc", per_page: 100 }, headers: headers
    subjects = JSON.parse(response.body)["data"].map { |a| a["subject"] }
    expect(subjects).to eq(subjects.sort)

    get "/api/v1/activities", params: { sort: "password_digest", direction: "desc" }, headers: headers
    expect(response).to have_http_status(:ok)
  end

  it "ignores unknown kinds" do
    get "/api/v1/activities", params: { kind: "party", per_page: 100 }, headers: headers

    expect(JSON.parse(response.body)["data"].length).to eq(4)
  end
end
