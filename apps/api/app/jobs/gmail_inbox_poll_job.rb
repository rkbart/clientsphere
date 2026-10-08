# Polls every Gmail-connected workspace inbox for unseen replies.
# Runs every 15 minutes via Solid Queue recurring tasks
# (config/recurring.yml). Each account is isolated: one mailbox failing
# never blocks the others.
class GmailInboxPollJob < ApplicationJob
  queue_as :default

  def perform
    EmailSetting.where(provider: "gmail").find_each do |setting|
      next if setting.from_address.blank? || setting.smtp_password.blank?

      InboundEmail::GmailPoller.call(setting.account)
    end
  end
end
