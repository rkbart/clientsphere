require "rails_helper"

RSpec.describe "Deal summary", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-ds@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }
  let(:pipeline) { account.pipelines.create!(name: "Sales") }
  let(:open_stage) { pipeline.stages.find_by(kind: :open) }
  let(:won_stage) { pipeline.stages.find_by(kind: :won) }

  def create_deal(attrs = {})
    account.deals.create!({
      title: "Big deal",
      amount: 10_000,
      currency: "USD",
      pipeline: pipeline,
      stage: open_stage,
      probability: 50,
      expected_close_date: 10.days.from_now.to_date
    }.merge(attrs))
  end

  it "summarizes an active deal without AI" do
    deal = create_deal
    account.activities.create!(creator: owner, kind: :call, subject: "Intro call", deal: deal)

    get "/api/v1/deals/#{deal.id}/summary", headers: headers

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["summary"]).to include("Big deal", open_stage.name, "$10,000")
    expect(body["summary"]).to include("Intro call")
    expect(body["stale"]).to be(false)
    expect(body["facts"]["position"]["stage"]).to eq(open_stage.name)
    expect(body["facts"]["position"]["amount"]).to eq("$10,000")
    expect(body["facts"]["activity"]["tone"]).to eq("ok")
  end

  it "flags a stale deal with overdue tasks" do
    deal = create_deal(expected_close_date: 3.days.ago.to_date, created_at: 30.days.ago)
    account.activities.create!(
      creator: owner, kind: :task, subject: "Send quote", deal: deal,
      due_at: 5.days.ago, created_at: 20.days.ago
    )

    get "/api/v1/deals/#{deal.id}/summary", headers: headers

    body = JSON.parse(response.body)
    expect(body["summary"]).to include("Close date passed")
    expect(body["summary"]).to include("stale")
    expect(body["summary"]).to include("1 overdue task")
    expect(body["stale"]).to be(true)
    expect(body["facts"]["close"]["tone"]).to eq("bad")
    expect(body["facts"]["activity"]["tone"]).to eq("bad")
    expect(body["facts"]["activity"]["overdue_tasks"]).to eq(1)
  end

  it "reports a closed deal as not stale" do
    deal = create_deal(stage: won_stage, closed_at: 2.days.ago)

    get "/api/v1/deals/#{deal.id}/summary", headers: headers

    body = JSON.parse(response.body)
    expect(body["summary"]).to include("Closed as won")
    expect(body["stale"]).to be(false)
  end

  it "requires authentication" do
    deal = create_deal

    get "/api/v1/deals/#{deal.id}/summary"

    expect(response).to have_http_status(:unauthorized)
  end
end
