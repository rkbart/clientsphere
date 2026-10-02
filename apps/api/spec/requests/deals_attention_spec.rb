require "rails_helper"

RSpec.describe "Deal attention", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-da@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }
  let(:pipeline) { account.pipelines.create!(name: "Sales") }
  let(:stage) { pipeline.stages.first }

  def create_deal(attrs = {})
    account.deals.create!(
      { title: "Deal", amount: 1000, pipeline: pipeline, stage: stage }.merge(attrs)
    )
  end

  it "returns null when nothing needs attention" do
    get "/api/v1/deals/attention", headers: headers

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["deal"]).to be_nil
  end

  it "prefers neglect plus overdue work over a merely soon close" do
    fresh = create_deal(title: "Fresh", expected_close_date: 2.days.from_now.to_date)
    account.activities.create!(creator: owner, kind: :call, subject: "Kickoff", deal: fresh)
    stale = create_deal(title: "Stale", expected_close_date: 30.days.from_now.to_date, created_at: 30.days.ago)
    2.times do |i|
      account.activities.create!(
        creator: owner, kind: :task, subject: "Task #{i}", deal: stale,
        due_at: 2.days.ago, created_at: 30.days.ago
      )
    end

    get "/api/v1/deals/attention", headers: headers

    body = JSON.parse(response.body)
    expect(body["deal"]["title"]).to eq("Stale")
    expect(body["stale"]).to be(true)
    expect(body["reasons"].join(" ")).to include("No touch in")
    expect(body["reasons"].join(" ")).to include("2 overdue tasks")
  end

  it "flags overdue close dates and tasks with reasons" do
    deal = create_deal(title: "Slipping", expected_close_date: 3.days.ago.to_date)
    account.activities.create!(
      creator: owner, kind: :task, subject: "Send quote", deal: deal,
      due_at: 2.days.ago, created_at: 20.days.ago
    )

    get "/api/v1/deals/attention", headers: headers

    body = JSON.parse(response.body)
    expect(body["deal"]["title"]).to eq("Slipping")
    expect(body["reasons"].join(" ")).to include("Close date passed 3 days ago")
    expect(body["reasons"].join(" ")).to include("1 overdue task")
  end

  it "ignores closed deals" do
    won = pipeline.stages.find_by!(kind: :won)
    create_deal(title: "Won", stage: won, closed_at: 1.day.ago, created_at: 60.days.ago)

    get "/api/v1/deals/attention", headers: headers

    expect(JSON.parse(response.body)["deal"]).to be_nil
  end

  it "scopes to the requested pipeline" do
    other = account.pipelines.create!(name: "Partner")
    create_deal(title: "Main", expected_close_date: 20.days.from_now.to_date, created_at: 30.days.ago)
    account.deals.create!(
      title: "Urgent partner", amount: 500, pipeline: other,
      stage: other.stages.first, expected_close_date: 1.day.ago.to_date
    )

    get "/api/v1/deals/attention", params: { pipeline_id: pipeline.id }, headers: headers
    expect(JSON.parse(response.body)["deal"]["title"]).to eq("Main")

    get "/api/v1/deals/attention", params: { pipeline_id: other.id }, headers: headers
    expect(JSON.parse(response.body)["deal"]["title"]).to eq("Urgent partner")
  end

  it "requires authentication" do
    get "/api/v1/deals/attention"

    expect(response).to have_http_status(:unauthorized)
  end
end
