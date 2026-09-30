module GoogleAuth
  # Turns an OmniAuth hash into a local user. Matching order:
  # 1. existing google_uid (stable across email changes),
  # 2. existing email (links invited users who never set a password),
  # 3. new user + personal workspace (same shape as email signup).
  class Resolver
    def self.resolve(auth)
      uid = auth.uid.to_s
      email = auth.info.email.to_s.downcase
      name = auth.info.name.presence || email.split("@").first

      user = User.find_by(google_uid: uid) || User.find_by(email: email)
      if user
        updates = {}
        updates[:google_uid] = uid if user.google_uid.nil?
        # Keep email in sync when Google reports a change for the same uid.
        # Guard against collisions (another account already took the address).
        updates[:email] = email if user.email != email && User.find_by(email: email).nil?
        updates[:current_account] = user.accounts.first if user.current_account.nil? && user.accounts.any?
        user.update!(updates) if updates.any?
        return user
      end

      User.transaction do
        account = Account.create!(name: "#{name}'s workspace")
        user = User.create!(
          name: name, email: email,
          password: SecureRandom.hex(24), google_uid: uid
        )
        Membership.create!(account: account, user: user, role: :owner)
        user.update!(current_account: account)
        user
      end
    end
  end
end
