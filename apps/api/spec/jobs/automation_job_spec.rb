require "rails_helper"

RSpec.describe AutomationJob, type: :job do
  include ActiveJob::TestHelper
  include ActiveSupport::Testing::TimeHelpers

  let(:account) { Account.create!(name: "Acme") }
  let(:owner) do
    User.create!(name: "Owner", email: "owner-aj@example.com", password: "password123").tap do |u|
      Membership.create!(account: account, user: u, role: :owner)
    end
  end

  def create_automation(delay_days:)
    account.automations.create!(
      name: "Follow up",
      trigger_type: :contact_created,
      is_active: true,
      delay_days: delay_days,
      actions: [{ "type" => "create_task", "subject" => "Follow up" }]
    )
  end

  it "executes immediately when delay_days is 0" do
    owner
    contact = account.contacts.create!(first_name: "John", email: "john-aj@example.com")
    automation = create_automation(delay_days: 0)
    clear_enqueued_jobs

    perform_enqueued_jobs do
      described_class.perform_later(automation.id, "contact_created", "Contact", contact.id)
    end

    expect(automation.automation_runs.where(status: :completed).count).to eq(1)
    expect(account.activities.where(subject: "Follow up").count).to eq(1)
  end

  it "schedules the job with wait_until when delay_days is set" do
    owner
    automation = create_automation(delay_days: 3)

    account.contacts.create!(first_name: "John", email: "john-aj@example.com")

    expect(automation.automation_runs.count).to eq(0)
    expect(enqueued_jobs.size).to eq(1)
    scheduled_at = enqueued_jobs.first["scheduled_at"] || enqueued_jobs.first[:scheduled_at]
    expect(scheduled_at).to be_present
    scheduled_f = scheduled_at.is_a?(String) ? Time.zone.parse(scheduled_at).to_f : scheduled_at.to_f
    expect(scheduled_f).to be_within(10).of(3.days.from_now.to_f)
  end

  it "executes once the delay has passed" do
    owner
    contact = account.contacts.create!(first_name: "John", email: "john-aj@example.com")
    automation = create_automation(delay_days: 3)
    clear_enqueued_jobs

    travel_to 4.days.from_now do
      perform_enqueued_jobs do
        described_class.perform_later(automation.id, "contact_created", "Contact", contact.id)
      end
    end

    expect(automation.automation_runs.where(status: :completed).count).to eq(1)
    expect(account.activities.where(subject: "Follow up").count).to eq(1)
  end
end
