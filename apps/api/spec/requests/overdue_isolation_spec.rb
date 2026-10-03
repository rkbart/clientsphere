require "rails_helper"

RSpec.describe "Overdue isolation across deals", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-iso@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }
  let(:pipeline) { account.pipelines.create!(name: "P") }
  let(:stage) { pipeline.stages.create!(name: "S", position: 1) }

  it "completing one deal's task leaves other deals' overdue tasks visible" do
    deal_a = account.deals.create!(title: "A", pipeline: pipeline, stage: stage)
    deal_b = account.deals.create!(title: "B", pipeline: pipeline, stage: stage)
    task_a = account.activities.create!(creator: owner, kind: :task, subject: "A overdue", due_at: 2.days.ago, deal: deal_a)
    account.activities.create!(creator: owner, kind: :task, subject: "B overdue", due_at: 2.days.ago, deal: deal_b)

    # flat body, exactly what the frontend sends
    patch "/api/v1/activities/#{task_a.id}",
          params: { completed_at: Time.current.iso8601 }.to_json,
          headers: headers.merge("CONTENT_TYPE" => "application/json")
    expect(response).to have_http_status(:ok)
    expect(task_a.reload.completed_at).to be_present

    get "/api/v1/activities", params: { deal_id: deal_b.id, kind: "task", overdue: "true" }, headers: headers
    subjects = JSON.parse(response.body)["data"].map { |a| a["subject"] }
    expect(subjects).to contain_exactly("B overdue")

    get "/api/v1/activities", params: { deal_id: deal_a.id, kind: "task", overdue: "true" }, headers: headers
    expect(JSON.parse(response.body)["data"]).to be_empty
  end
end
