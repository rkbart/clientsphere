require "rails_helper"

RSpec.describe OverdueActivityCheckJob, type: :job do
  include ActiveJob::TestHelper

  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-od@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
      u.update!(current_account: account)
    end
  end

  before do
    account.automations.create!(
      name: "Nudge overdue", trigger_type: :activity_overdue, is_active: true,
      actions: [{ "type" => "create_task", "subject" => "Follow up overdue" }]
    )
  end

  it "fires the trigger once per overdue activity" do
    overdue = account.activities.create!(creator: owner, kind: :call, subject: "Late",
                                         due_at: 2.days.ago)
    account.activities.create!(creator: owner, kind: :call, subject: "Future",
                               due_at: 2.days.from_now)
    account.activities.create!(creator: owner, kind: :call, subject: "Done",
                               due_at: 2.days.ago, completed_at: 1.day.ago)

    perform_enqueued_jobs { described_class.perform_later }

    expect(overdue.reload.overdue_fired_at).to be_present
    expect(account.automation_runs.where(status: :completed).count).to eq(1)

    perform_enqueued_jobs { described_class.perform_later }

    expect(account.automation_runs.count).to eq(1)
  end
end
