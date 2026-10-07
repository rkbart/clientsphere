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

  describe "owner limit" do
    def member_membership(email)
      user = User.create!(name: email, email: email, password: "password123")
      Membership.create!(account: account, user: user, role: :member)
    end

    it "allows a second owner" do
      membership = member_membership("second@example.com")

      patch "/api/v1/memberships/#{membership.id}", params: { role: "owner" }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.role).to eq("owner")
    end

    it "refuses a third owner" do
      Membership.create!(account: account, user: User.create!(
        name: "Two", email: "two@example.com", password: "password123"
      ), role: :owner)
      membership = member_membership("third@example.com")

      patch "/api/v1/memberships/#{membership.id}", params: { role: "owner" }, headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["error"]).to include("at most 2")
      expect(membership.reload.role).to eq("member")
    end

    it "lets an existing owner keep the owner role" do
      co_owner = member_membership("keep@example.com")
      co_owner.update!(role: :owner)

      patch "/api/v1/memberships/#{co_owner.id}", params: { role: "owner" }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
    end
  end

  describe "admin tier" do
    let(:admin_user) do
      User.create!(name: "Adm", email: "adm-tier@example.com", password: "password123").tap do |u|
        Membership.create!(account: account, user: u, role: :admin)
        u.update!(current_account: account)
      end
    end
    let(:admin_headers) { { "Authorization" => "Bearer #{Session.create!(user: admin_user).token}" } }

    it "forbids an admin from promoting someone to admin" do
      membership = Membership.create!(account: account, user: User.create!(
        name: "Up", email: "up-tier@example.com", password: "password123"
      ), role: :member)

      patch "/api/v1/memberships/#{membership.id}", params: { role: "admin" }, headers: admin_headers, as: :json

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)["error"]).to include("Only owners")
      expect(membership.reload.role).to eq("member")
    end

    it "forbids an admin from demoting another admin" do
      target = Membership.create!(account: account, user: User.create!(
        name: "Down", email: "down-tier@example.com", password: "password123"
      ), role: :admin)

      patch "/api/v1/memberships/#{target.id}", params: { role: "member" }, headers: admin_headers, as: :json

      expect(response).to have_http_status(:forbidden)
      expect(target.reload.role).to eq("admin")
    end

    it "still lets an admin manage members and viewers" do
      membership = Membership.create!(account: account, user: User.create!(
        name: "Plain", email: "plain-tier@example.com", password: "password123"
      ), role: :member)

      patch "/api/v1/memberships/#{membership.id}", params: { role: "viewer" }, headers: admin_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.role).to eq("viewer")
    end

    it "lets an owner change the admin role" do
      membership = Membership.create!(account: account, user: User.create!(
        name: "ByOwner", email: "owner-tier@example.com", password: "password123"
      ), role: :member)

      patch "/api/v1/memberships/#{membership.id}", params: { role: "admin" }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
    end
  end

  it "refuses to remove the last owner" do
    membership = owner.memberships.find_by(account: account)

    delete "/api/v1/memberships/#{membership.id}", headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
    expect(Membership.exists?(membership.id)).to be(true)
  end

  it "refuses to remove yourself even when another owner remains" do
    co_owner = User.create!(name: "Co", email: "co-owner@example.com", password: "password123")
    Membership.create!(account: account, user: co_owner, role: :owner)
    own = owner.memberships.find_by(account: account)

    delete "/api/v1/memberships/#{own.id}", headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)["error"]).to include("yourself")
    expect(Membership.exists?(own.id)).to be(true)
  end

  it "lets an admin remove a member" do
    admin_user = User.create!(name: "Adm", email: "adm-rm@example.com", password: "password123")
    Membership.create!(account: account, user: admin_user, role: :admin)
    member_user = User.create!(name: "Mem", email: "mem-rm@example.com", password: "password123")
    target = Membership.create!(account: account, user: member_user, role: :member)

    delete "/api/v1/memberships/#{target.id}", headers: headers

    expect(response).to have_http_status(:no_content)
    expect(Membership.exists?(target.id)).to be(false)
  end

  describe "removing a member" do
    let(:member_user) do
      User.create!(name: "Gone", email: "gone-soon@example.com", password: "password123").tap do |u|
        Membership.create!(account: account, user: u, role: :member)
        u.update!(current_account: account)
      end
    end
    let!(:member_session) { Session.create!(user: member_user) }
    let(:target) { member_user.memberships.find_by(account: account) }

    before do
      stub_const("ENV", ENV.to_h.merge("RESEND_API_KEY" => "re_test"))
      sender = class_double("Resend::Emails").as_stubbed_const
      allow(sender).to receive(:send).and_return({ id: "msg_1" })
    end

    it "revokes sessions so the old token stops working immediately" do
      delete "/api/v1/memberships/#{target.id}", headers: headers

      expect(response).to have_http_status(:no_content)
      get "/api/v1/contacts", headers: { "Authorization" => "Bearer #{member_session.token}" }
      expect(response).to have_http_status(:unauthorized)
    end

    it "blocks password login once no memberships remain" do
      delete "/api/v1/memberships/#{target.id}", headers: headers

      post "/api/v1/auth/login",
           params: { email: member_user.email, password: "password123" }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "lets the removed email rejoin via a fresh invite with onboarding reset" do
      delete "/api/v1/memberships/#{target.id}", headers: headers
      member_user.update!(welcome_seen_at: Time.current)

      post "/api/v1/invitations",
           params: { invitation: { email: member_user.email, role: "member" } },
           headers: headers, as: :json
      token = JSON.parse(response.body)["token"]

      post "/api/v1/invitations/#{token}/accept", as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["user"]["welcome_seen_at"]).to be_nil
      expect(member_user.reload.memberships.where(account: account)).to exist
    end

    it "keeps onboarding done for an existing user who already has a workspace" do
      # The reported bug: an OAuth user who onboarded in their own workspace
      # accepted a second workspace's invite and got the setup modal again.
      member_user.update!(welcome_seen_at: Time.current)
      own = Account.create!(name: "Their Own")
      Membership.create!(account: own, user: member_user, role: :owner)
      member_user.update!(current_account: own)

      # A second workspace invites them (not the one they're in).
      other = Account.create!(name: "Other Co")
      other_owner = User.create!(name: "OO", email: "oo-ws@example.com", password: "password123")
      Membership.create!(account: other, user: other_owner, role: :owner)
      other_owner.update!(current_account: other)
      other_headers = { "Authorization" => "Bearer #{Session.create!(user: other_owner).token}" }

      post "/api/v1/invitations",
           params: { invitation: { email: member_user.email, role: "member" } },
           headers: other_headers, as: :json
      token = JSON.parse(response.body)["token"]

      post "/api/v1/invitations/#{token}/accept", as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["user"]["welcome_seen_at"]).to be_present
      expect(member_user.reload.current_account).to eq(other)
      expect(member_user.memberships.where(account: own)).to exist
    end
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
