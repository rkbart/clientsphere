require "rails_helper"

RSpec.describe "Deals CRUD", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-deal@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }
  let(:pipeline) { account.pipelines.create!(name: "Sales", is_default: true) }
  let(:stage) { pipeline.stages.first }

  def create_deal(attrs = {})
    account.deals.create!(
      { title: "Renewal", pipeline: pipeline, stage: stage }.merge(attrs)
    )
  end

  it "updates a deal through the web client's wrapped payload" do
    deal = create_deal

    patch "/api/v1/deals/#{deal.id}",
          params: { deal: { title: "Renamed", contact_id: nil } },
          headers: headers,
          as: :json

    expect(response).to have_http_status(:ok)
    expect(deal.reload.title).to eq("Renamed")
  end

  it "soft deletes a deal and hides it from the index" do
    deal = create_deal

    delete "/api/v1/deals/#{deal.id}", headers: headers

    expect(response).to have_http_status(:no_content)
    expect(deal.reload.discarded_at).to be_present

    get "/api/v1/deals", headers: headers
    expect(JSON.parse(response.body)["data"].map { |d| d["id"] }).not_to include(deal.id)
  end

  it "returns 404 for a discarded deal on read, update and move" do
    deal = create_deal
    deal.discard!

    get "/api/v1/deals/#{deal.id}", headers: headers
    expect(response).to have_http_status(:not_found)

    patch "/api/v1/deals/#{deal.id}", params: { deal: { title: "x" } }, headers: headers, as: :json
    expect(response).to have_http_status(:not_found)
  end

  it "404s on a discarded deal's tags endpoint" do
    deal = create_deal
    deal.discard!

    get "/api/v1/deals/#{deal.id}/tags", headers: headers
    expect(response).to have_http_status(:not_found)
  end

  it "sorts by title and amount with asc/desc" do
    create_deal(title: "Zebra", amount: 500)
    create_deal(title: "Aardvark", amount: 1000)

    get "/api/v1/deals", params: { sort: "title", direction: "asc" }, headers: headers
    expect(JSON.parse(response.body)["data"].map { |d| d["title"] }).to eq(["Aardvark", "Zebra"])

    get "/api/v1/deals", params: { sort: "amount", direction: "desc" }, headers: headers
    expect(JSON.parse(response.body)["data"].map { |d| d["amount"].to_f }).to eq([1000.0, 500.0])

    get "/api/v1/deals", params: { sort: "owner_id", direction: "asc" }, headers: headers
    expect(response).to have_http_status(:ok)
  end

  it "filters by stage and tag" do
    won = pipeline.stages.find_by!(kind: :won)
    create_deal(title: "Open one")
    create_deal(title: "Won one", stage: won)
    tag = account.tags.create!(name: "hot")
    Tagging.create!(account: account, tag: tag, taggable: Deal.find_by(title: "Open one"))

    get "/api/v1/deals", params: { stage_id: won.id }, headers: headers
    expect(JSON.parse(response.body)["data"].map { |d| d["title"] }).to eq(["Won one"])

    get "/api/v1/deals", params: { tag_id: tag.id }, headers: headers
    expect(JSON.parse(response.body)["data"].map { |d| d["title"] }).to eq(["Open one"])
  end

  it "defaults probability from the stage on create" do
    post "/api/v1/deals",
         params: { deal: { title: "Fresh", pipeline_id: pipeline.id, stage_id: stage.id } },
         headers: headers

    expect(response).to have_http_status(:created)
    expect(JSON.parse(response.body)["probability"]).to eq(stage.probability)
  end

  it "follows the stage on move unless manually overridden" do
    untouched = create_deal(probability: nil)
    expect(untouched.reload.probability).to eq(stage.probability)

    proposal = pipeline.stages.find_by!(name: "Proposal")
    patch "/api/v1/deals/#{untouched.id}/move", params: { stage_id: proposal.id }, headers: headers
    expect(untouched.reload.probability).to eq(proposal.probability)

    manual = create_deal(title: "Manual", probability: 90)
    patch "/api/v1/deals/#{manual.id}/move", params: { stage_id: proposal.id }, headers: headers
    expect(manual.reload.probability).to eq(90)
  end

  it "rejects probability outside 0-100" do
    post "/api/v1/deals",
         params: { deal: { title: "Bad", pipeline_id: pipeline.id, stage_id: stage.id, probability: 150 } },
         headers: headers
    expect(response).to have_http_status(:unprocessable_entity)

    post "/api/v1/deals",
         params: { deal: { title: "Bad", pipeline_id: pipeline.id, stage_id: stage.id, probability: -5 } },
         headers: headers
    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "searches by title and filters by pipeline" do
    create_deal(title: "Beta contract")
    create_deal(title: "Gamma contract")
    other = account.pipelines.create!(name: "Partner")
    account.deals.create!(title: "Delta contract", pipeline: other, stage: other.stages.first)

    get "/api/v1/deals", params: { q: "Beta" }, headers: headers
    expect(JSON.parse(response.body)["data"].map { |d| d["title"] }).to eq(["Beta contract"])

    get "/api/v1/deals", params: { pipeline_id: other.id }, headers: headers
    expect(JSON.parse(response.body)["data"].map { |d| d["title"] }).to eq(["Delta contract"])
  end

  it "paginates with meta and includes stage and company" do
    company = account.companies.create!(name: "Acme Co")
    create_deal(title: "First", company: company)
    2.times { |i| create_deal(title: "D#{i}") }

    get "/api/v1/deals", params: { per_page: 2, page: 1, sort: "title" }, headers: headers
    body = JSON.parse(response.body)

    expect(body["data"].length).to eq(2)
    expect(body["meta"]["total_count"]).to eq(3)
    expect(body["meta"]["total_pages"]).to eq(2)

    get "/api/v1/deals", params: { q: "First" }, headers: headers
    row = JSON.parse(response.body)["data"].first
    expect(row["stage"]["name"]).to be_present
    expect(row["company"]["name"]).to eq("Acme Co")
  end

  it "moves a deal between stages" do
    deal = create_deal
    target = pipeline.stages.last

    patch "/api/v1/deals/#{deal.id}/move",
          params: { stage_id: target.id, position: 0 }, headers: headers, as: :json

    expect(response).to have_http_status(:ok)
    expect(deal.reload.stage_id).to eq(target.id)
  end
end
