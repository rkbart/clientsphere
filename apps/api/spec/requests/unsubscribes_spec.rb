require "rails_helper"

RSpec.describe "Public unsubscribe", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:contact) { account.contacts.create!(first_name: "Ada", email: "ada@example.com") }
  let(:sequence) { account.email_sequences.create!(name: "Drip") }
  let(:enrollment) do
    account.sequence_enrollments.create!(sequence: sequence, contact: contact, current_step: 1, status: :active)
  end

  def token_for(id)
    Rails.application.message_verifier("sequence_unsubscribe").generate(id)
  end

  it "unsubscribes with a valid token without login" do
    post "/api/v1/unsubscribe", params: { token: token_for(enrollment.id) }, as: :json

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)).to eq({ "unsubscribed" => true })
    expect(enrollment.reload).to be_unsubscribed
  end

  it "is idempotent when already unsubscribed" do
    enrollment.update!(status: :unsubscribed)

    post "/api/v1/unsubscribe", params: { token: token_for(enrollment.id) }, as: :json

    expect(response).to have_http_status(:ok)
    expect(enrollment.reload).to be_unsubscribed
  end

  it "returns 404 for a forged token" do
    post "/api/v1/unsubscribe", params: { token: "bogus" }, as: :json

    expect(response).to have_http_status(:not_found)
  end

  it "returns 404 for an unknown enrollment" do
    post "/api/v1/unsubscribe", params: { token: token_for(SecureRandom.uuid) }, as: :json

    expect(response).to have_http_status(:not_found)
  end
end
