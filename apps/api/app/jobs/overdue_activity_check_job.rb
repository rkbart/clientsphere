# Fires the activity_overdue automation trigger for newly-overdue activities.
# Runs hourly via Solid Queue recurring tasks (config/recurring.yml).
# Each activity fires once (overdue_fired_at) so automations don't repeat.
class OverdueActivityCheckJob < ApplicationJob
  queue_as :default

  def perform
    Activity.where(completed_at: nil)
            .where("due_at < ?", Time.current)
            .where(overdue_fired_at: nil)
            .find_each do |activity|
      Automations::Trigger.call(activity.account, :activity_overdue, activity)
      activity.update_column(:overdue_fired_at, Time.current)
    end
  end
end
