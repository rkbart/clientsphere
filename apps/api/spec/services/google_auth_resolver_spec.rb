require "rails_helper"

RSpec.describe GoogleAuth::Resolver do
  def auth_hash(uid:, email:, name:)
    OmniAuth::AuthHash.new({
      provider: "google_oauth2", uid: uid,
      info: { email: email, name: name },
    })
  end

  it "creates a user with a personal workspace for new emails" do
    user = described_class.resolve(auth_hash(uid: "g-1", email: "new-g@example.com", name: "New G"))

    expect(user).to be_persisted
    expect(user.google_uid).to eq("g-1")
    expect(user.role_for(user.current_account)).to eq("owner")
  end

  it "links an invited user by email" do
    account = Account.create!(name: "Acme")
    owner = User.create!(name: "O", email: "o-g@example.com", password: "password123")
    Membership.create!(account: account, user: owner, role: :owner)
    invited = User.create!(name: "Inv", email: "inv-g@example.com", password: SecureRandom.hex(16))
    Membership.create!(account: account, user: invited, role: :member)

    user = described_class.resolve(auth_hash(uid: "g-2", email: "inv-g@example.com", name: "Inv"))

    expect(user.id).to eq(invited.id)
    expect(user.reload.google_uid).to eq("g-2")
  end

  it "finds returning users by uid" do
    first = described_class.resolve(auth_hash(uid: "g-3", email: "back@example.com", name: "Back"))

    second = described_class.resolve(auth_hash(uid: "g-3", email: "changed@example.com", name: "Back"))

    expect(second.id).to eq(first.id)
  end
end
