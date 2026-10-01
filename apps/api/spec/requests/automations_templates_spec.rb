require "rails_helper"

RSpec.describe "Automation templates", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-tpl@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  it "returns the template catalog" do
    get "/api/v1/automations/templates", headers: headers

    expect(response).to have_http_status(:ok)
    templates = JSON.parse(response.body)
    expect(templates).not_to be_empty
    templates.each do |t|
      expect(t.keys).to include("key", "name", "description", "trigger_type", "delay_days", "conditions", "actions")
      expect(Automation.trigger_types).to include(t["trigger_type"])
    end
  end

  it "requires authentication" do
    get "/api/v1/automations/templates"

    expect(response).to have_http_status(:unauthorized)
  end

  it "only uses known triggers, actions and condition keys" do
    get "/api/v1/automations/templates", headers: headers

    JSON.parse(response.body).each do |t|
      t["actions"].each do |a|
        expect(%w[create_task send_email add_tag move_stage call_webhook]).to include(a["type"])
      end
      t["conditions"].each_key do |k|
        expect(%w[min_amount status tag]).to include(k)
      end
    end
  end

  it "every template can be saved as an automation" do
    get "/api/v1/automations/templates", headers: headers

    JSON.parse(response.body).each do |t|
      post "/api/v1/automations",
           params: {
             automation: {
               name: t["name"],
               trigger_type: t["trigger_type"],
               delay_days: t["delay_days"],
               conditions: t["conditions"],
               actions: t["actions"],
               is_active: false
             }
           },
           headers: headers

      expect(response).to have_http_status(:created), "template #{t['key']} failed: #{response.body}"
    end
  end
end
