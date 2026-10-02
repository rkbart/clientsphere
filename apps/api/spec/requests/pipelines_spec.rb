require "rails_helper"

RSpec.describe "Pipelines", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-pl@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  it "creates a pipeline with default stages" do
    post "/api/v1/pipelines", params: { pipeline: { name: "Partner" } }, headers: headers

    expect(response).to have_http_status(:created)
    pipeline = Pipeline.find(JSON.parse(response.body)["id"])
    expect(pipeline.stages.map(&:name)).to eq(%w[New Contacted Proposal Negotiation Won Lost])
  end

  it "keeps a single default pipeline" do
    first = account.pipelines.create!(name: "Sales", is_default: true)

    post "/api/v1/pipelines",
         params: { pipeline: { name: "Partner", is_default: true } },
         headers: headers

    expect(response).to have_http_status(:created)
    expect(first.reload.is_default).to be(false)
    expect(account.pipelines.where(is_default: true).count).to eq(1)
  end

  it "404s for another account's pipeline" do
    other = Account.create!(name: "Other")
    foreign = other.pipelines.create!(name: "Theirs")

    get "/api/v1/pipelines/#{foreign.id}", headers: headers
    expect(response).to have_http_status(:not_found)

    delete "/api/v1/pipelines/#{foreign.id}", headers: headers
    expect(response).to have_http_status(:not_found)
    expect(Pipeline.find_by(id: foreign.id)).to be_present
  end

  it "refuses to delete a pipeline with deals" do
    pipeline = account.pipelines.create!(name: "Sales")
    account.deals.create!(title: "Big", pipeline: pipeline, stage: pipeline.stages.first)

    delete "/api/v1/pipelines/#{pipeline.id}", headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
    expect(Pipeline.find_by(id: pipeline.id)).to be_present
  end

  it "creates, updates and refuses to delete a stage with deals" do
    pipeline = account.pipelines.create!(name: "Sales")

    post "/api/v1/pipelines/#{pipeline.id}/stages",
         params: { stage: { name: "Qualification", kind: "open", position: 1, color: "#22d3ee", probability: 15 } },
         headers: headers
    expect(response).to have_http_status(:created)
    stage_id = JSON.parse(response.body)["id"]

    patch "/api/v1/pipelines/#{pipeline.id}/stages/#{stage_id}",
          params: { stage: { name: "Qualified" } },
          headers: headers
    expect(response).to have_http_status(:ok)

    account.deals.create!(title: "Big", pipeline: pipeline, stage_id: stage_id)
    delete "/api/v1/pipelines/#{pipeline.id}/stages/#{stage_id}", headers: headers
    expect(response).to have_http_status(:unprocessable_entity)
  end
end
