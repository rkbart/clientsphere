module Deals
  # Picks the open deal most in need of attention. Scores combine close-date
  # urgency, staleness and overdue tasks; the winner comes back with
  # human-readable reasons for the dashboard card.
  class Attention
    STALE_AFTER_DAYS = 14
    CLOSING_SOON_DAYS = 7
    OVERDUE_TASK_POINTS = 5
    MAX_TASK_POINTS = 25

    def self.call(scope)
      candidates = scope.kept.where(closed_at: nil).includes(:stage, :activities)
      scored = candidates.filter_map { |deal| score(deal) }
      scored.max_by do |entry|
        urgency_days = (close_rank(entry[:deal]) - Date.current).to_i
        [entry[:score], -urgency_days, -entry[:deal].created_at.to_i]
      end
    end

    def self.score(deal)
      points = 0
      reasons = []

      if deal.expected_close_date.nil?
        points += 5
        reasons << "No close date set."
      elsif deal.expected_close_date < Date.current
        days = (Date.current - deal.expected_close_date).to_i
        points += 50
        reasons << "Close date passed #{days} #{day_label(days)} ago."
      elsif deal.expected_close_date <= CLOSING_SOON_DAYS.days.from_now.to_date
        days = (deal.expected_close_date - Date.current).to_i
        points += 30
        reasons << "Closes in #{days} #{day_label(days)}."
      end

      last_touch = deal.activities.maximum(:created_at) || deal.created_at
      quiet_days = ((Time.current - last_touch) / 1.day).floor
      if quiet_days > STALE_AFTER_DAYS
        points += 25
        reasons << (deal.activities.exists? ? "No touch in #{quiet_days} days." : "No activity logged yet.")
      end

      overdue_tasks = deal.activities.where(kind: :task, completed_at: nil).where("due_at < ?", Time.current).count
      if overdue_tasks.positive?
        points += [overdue_tasks * OVERDUE_TASK_POINTS, MAX_TASK_POINTS].min
        reasons << "#{overdue_tasks} overdue #{overdue_tasks == 1 ? 'task' : 'tasks'}."
      end

      return nil if points.zero?

      {
        deal: deal,
        score: points,
        reasons: reasons,
        stale: quiet_days > STALE_AFTER_DAYS
      }
    end

    def self.close_rank(deal)
      deal.expected_close_date || Date.new(9999, 12, 31)
    end

    def self.day_label(days)
      days == 1 ? "day" : "days"
    end
    private_class_method :score, :close_rank, :day_label
  end
end
