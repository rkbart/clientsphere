require "rails_helper"

RSpec.describe "GraphQL API", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-gql@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  def execute_query(query, variables: nil)
    post "/graphql", params: { query: query, variables: variables }, headers: headers, as: :json
    JSON.parse(response.body)
  end

  describe "queries" do
    it "returns current user" do
      result = execute_query("{ currentUser { id name email } }")
      expect(result["data"]["currentUser"]["email"]).to eq("owner-gql@example.com")
    end

    it "lists contacts with pagination" do
      account.contacts.create!(first_name: "Ada", email: "ada-gql@example.com")
      account.contacts.create!(first_name: "Bea", email: "bea-gql@example.com")

      result = execute_query("{ contacts { edges { node { id firstName email } } } }")
      emails = result["data"]["contacts"]["edges"].map { |e| e["node"]["email"] }
      expect(emails).to include("ada-gql@example.com", "bea-gql@example.com")
    end

    it "fetches a single contact" do
      contact = account.contacts.create!(first_name: "Cyd", email: "cyd-gql@example.com")
      result = execute_query("{ contact(id: \"#{contact.id}\") { firstName email } }")
      expect(result["data"]["contact"]["firstName"]).to eq("Cyd")
    end

    it "lists companies" do
      account.companies.create!(name: "TechCorp")
      result = execute_query("{ companies { edges { node { id name } } } }")
      names = result["data"]["companies"]["edges"].map { |e| e["node"]["name"] }
      expect(names).to include("TechCorp")
    end

    it "lists deals" do
      pipeline = account.pipelines.create!(name: "Sales", is_default: true)
      stage = pipeline.stages.create!(name: "New", position: 0, kind: :open, account_id: account.id)
      account.deals.create!(title: "Big Deal", pipeline: pipeline, stage: stage, amount: 5000)
      result = execute_query("{ deals { edges { node { id title amount } } } }")
      titles = result["data"]["deals"]["edges"].map { |e| e["node"]["title"] }
      expect(titles).to include("Big Deal")
    end

    it "lists activities" do
      account.activities.create!(creator: owner, kind: :call, subject: "Follow up")
      result = execute_query("{ activities { edges { node { id subject kind } } } }")
      subjects = result["data"]["activities"]["edges"].map { |e| e["node"]["subject"] }
      expect(subjects).to include("Follow up")
    end

    it "requires authentication" do
      post "/graphql", params: { query: "{ currentUser { id } }" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "mutations" do
    it "creates a contact" do
      query = <<~GQL
        mutation {
          createContact(firstName: "New", email: "new-gql@example.com") {
            contact { id firstName email }
            errors
          }
        }
      GQL
      result = execute_query(query)
      expect(result["data"]["createContact"]["errors"]).to be_empty
      expect(result["data"]["createContact"]["contact"]["firstName"]).to eq("New")
      expect(account.contacts.find_by(email: "new-gql@example.com")).to be_present
    end

    it "updates a contact" do
      contact = account.contacts.create!(first_name: "Old", email: "old-gql@example.com")
      query = <<~GQL
        mutation {
          updateContact(id: "#{contact.id}", firstName: "Updated") {
            contact { id firstName }
            errors
          }
        }
      GQL
      result = execute_query(query)
      expect(result["data"]["updateContact"]["errors"]).to be_empty
      expect(contact.reload.first_name).to eq("Updated")
    end

    it "deletes a contact" do
      contact = account.contacts.create!(first_name: "Delete", email: "del-gql@example.com")
      query = <<~GQL
        mutation {
          deleteContact(id: "#{contact.id}") { success }
        }
      GQL
      result = execute_query(query)
      expect(result["data"]["deleteContact"]["success"]).to be(true)
      expect(contact.reload.discarded_at).to be_present
    end

    it "creates a company" do
      query = <<~GQL
        mutation {
          createCompany(name: "NewCo") {
            company { id name }
            errors
          }
        }
      GQL
      result = execute_query(query)
      expect(result["data"]["createCompany"]["errors"]).to be_empty
      expect(account.companies.find_by(name: "NewCo")).to be_present
    end

    it "creates a deal" do
      pipeline = account.pipelines.create!(name: "Sales", is_default: true)
      stage = pipeline.stages.create!(name: "New", position: 0, kind: :open, account_id: account.id)
      query = <<~GQL
        mutation {
          createDeal(title: "New Deal", pipelineId: "#{pipeline.id}", stageId: "#{stage.id}") {
            deal { id title }
            errors
          }
        }
      GQL
      result = execute_query(query)
      expect(result["data"]["createDeal"]["errors"]).to be_empty
      expect(account.deals.find_by(title: "New Deal")).to be_present
    end

    it "creates an activity" do
      query = <<~GQL
        mutation {
          createActivity(kind: "call", subject: "New Call") {
            activity { id subject kind }
            errors
          }
        }
      GQL
      result = execute_query(query)
      expect(result["data"]["createActivity"]["errors"]).to be_empty
      expect(account.activities.find_by(subject: "New Call")).to be_present
    end

    it "returns validation errors" do
      query = <<~GQL
        mutation {
          createContact(firstName: "") {
            contact { id }
            errors
          }
        }
      GQL
      result = execute_query(query)
      expect(result["data"]["createContact"]["errors"]).not_to be_empty
    end
  end
end
