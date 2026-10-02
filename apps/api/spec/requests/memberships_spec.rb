require "rails_helper"

RSpec.describe "Team memberships", type: :request do
  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-team@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end
  let(:headers) { { "Authorization" => "Bearer #{Session.create!(user: owner).token}" } }

  it "lists members with embedded users" do
    get "/api/v1/memberships", headers: headers

    body = JSON.parse(response.body)
    expect(body.first).to include("role" => "owner")
    expect(body.first["user"]).to include("email" => "owner-team@example.com")
    expect(body.first["user"]).not_to have_key("password_digest")
  end

  it "changes a member role" do
    member_user = User.create!(name: "M", email: "m-team@example.com", password: "password123")
    membership = Membership.create!(account: account, user: member_user, role: :member)

    patch "/api/v1/memberships/#{membership.id}", params: { role: "admin" }, headers: headers, as: :json

    expect(response).to have_http_status(:ok)
    expect(membership.reload.role).to eq("admin")
  end

  it "refuses to demote the last owner" do
    membership = owner.memberships.find_by(account: account)

    patch "/api/v1/memberships/#{membership.id}", params: { role: "member" }, headers: headers, as: :json

    expect(response).to have_http_status(:unprocessable_entity)
    expect(membership.reload.role).to eq("owner")
  end

  it "refuses non-owner promotion to owner" do
    admin_user = User.create!(name: "A", email: "a-team@example.com", password: "password123")
    Membership.create!(account: account, user: admin_user, role: :admin)
    admin_user.update!(current_account: account)
    admin_headers = { "Authorization" => "Bearer #{Session.create!(user: admin_user).token}" }

    member_user = User.create!(name: "M2", email: "m2-team@example.com", password: "password123")
    membership = Membership.create!(account: account, user: member_user, role: :member)

    patch "/api/v1/memberships/#{membership.id}", params: { role: "owner" }, headers: admin_headers, as: :json

    expect(response).to have_http_status(:forbidden)
    expect(membership.reload.role).to eq("member")
  end

  it "rejects invalid roles" do
    member_user = User.create!(name: "M3", email: "m3-team@example.com", password: "password123")
    membership = Membership.create!(account: account, user: member_user, role: :member)

    patch "/api/v1/memberships/#{membership.id}", params: { role: "superadmin" }, headers: headers, as: :json

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "refuses to remove the last owner" do
    membership = owner.memberships.find_by(account: account)

    delete "/api/v1/memberships/#{membership.id}", headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
    expect(Membership.exists?(membership.id)).to be(true)
  end

  it "reports invite delivery status on create" do
    stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
    sender = class_double("Resend::Emails").as_stubbed_const
    allow(sender).to receive(:send).and_return({ id: "msg_1" })

    post "/api/v1/invitations",
         params: { invitation: { email: "teammate@example.com", role: "member" } },
         headers: headers, as: :json

    body = JSON.parse(response.body)
    expect(body["invite_sent"]).to be(true)
    expect(body["token"]).to be_present
  end

  it "builds a valid accept link" do
    invitation = Invitation.create!(account: account, invited_by: owner,
                                    email: "link@example.com", role: :member)

    link = Invitations::Notifier.invite_link(invitation, invitation.token)

    expect(link).to include("/accept-invite/#{invitation.token}?email=link%40example.com")
  end
end
