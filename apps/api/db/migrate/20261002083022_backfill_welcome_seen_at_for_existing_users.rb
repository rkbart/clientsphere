# Existing accounts chose their own password at signup, so they must not be
# prompted by the first-login setup modal. Only invitees (who arrive with a
# server-generated password) should see it.
class BackfillWelcomeSeenAtForExistingUsers < ActiveRecord::Migration[8.1]
  def up
    User.where(welcome_seen_at: nil).update_all(welcome_seen_at: Time.current)
  end

  def down
    # Irreversible: we cannot tell which accounts legitimately need setup.
  end
end
