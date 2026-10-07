module GoogleAuth
  # Turns an OmniAuth hash into a local user. Matching order:
  # 1. existing google_uid (stable across email changes),
  # 2. existing email (links invited users who never set a password),
  # 3. new user + personal workspace (same shape as email signup).
  class Resolver
    def self.refresh_token(auth)
      auth.credentials&.refresh_token.presence
    end
    private_class_method :refresh_token

    def self.resolve(auth)
      uid = auth.uid.to_s
      email = auth.info.email.to_s.downcase
      name = auth.info.name.presence || email.split("@").first

      user = User.find_by(google_uid: uid) || User.find_by(email: email)
      if user
        updates = {}
        updates[:google_uid] = uid if user.google_uid.nil?
        # Keep email in sync when Google reports a change for the same uid.
        # Guard against collisions (another address already took the address).
        updates[:email] = email if user.email != email && User.find_by(email: email).nil?
        updates[:current_account] = user.accounts.first if user.current_account.nil? && user.accounts.any?
        # A consented grant carries a fresh refresh token; a plain login
        # omits it — never blank an existing token with nil.
        updates[:google_refresh_token] = refresh_token(auth) if refresh_token(auth).present?
        updates[:google_email] = email if updates[:google_refresh_token] || user.google_email.nil?
        user.update!(updates) if updates.any?
        return user
      end

      User.transaction do
        account = Account.create!(name: "#{name}'s workspace")
        user = User.create!(
          name: name, email: email,
          password: SecureRandom.hex(24), google_uid: uid,
          google_refresh_token: refresh_token(auth), google_email: email
        )
        Membership.create!(account: account, user: user, role: :owner)
        user.update!(current_account: account)
        user
      end
    end
  end
end
