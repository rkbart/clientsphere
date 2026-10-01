module Deals
  # Deterministic, rule-based deal summary — no LLM involved. Built from
  # stage, value, close date and activity history. Cheap enough to compute
  # on every page load.
  class Summary
    STALE_AFTER_DAYS = 14
    QUIET_AFTER_DAYS = 7
    CLOSING_SOON_DAYS = 7

    def self.call(deal)
      new(deal).call
    end

    def initialize(deal)
      @deal = deal
    end

    def call
      { summary: lines.join("\n"), stale: stale? }
    end

    private

    def lines
      [position_line, close_line, activity_line].compact
    end

    def position_line
      value = formatted_amount
      weighted = weighted_amount
      base = "#{@deal.title} sits in #{@deal.stage&.name || 'no stage'}"
      if value
        base += " at #{value} (#{probability}% probability"
        base += ", ≈#{weighted} weighted" if weighted
        base += ")"
      end
      "#{base}."
    end

    def close_line
      if closed?
        "Closed as #{@deal.stage.kind} on #{date(@deal.closed_at)}."
      elsif @deal.expected_close_date.nil?
        "No close date set."
      elsif @deal.expected_close_date < Date.current
        days = (Date.current - @deal.expected_close_date).to_i
        "Close date passed #{days} #{day_label(days)} ago — update the date or move the deal."
      elsif @deal.expected_close_date <= CLOSING_SOON_DAYS.days.from_now.to_date
        days = (@deal.expected_close_date - Date.current).to_i
        "Closes in #{days} #{day_label(days)} (#{date(@deal.expected_close_date)})."
      else
        "Expected close: #{date(@deal.expected_close_date)}."
      end
    end

    def activity_line
      last = last_activity
      parts = []

      if last.nil?
        parts << "No activity logged yet — schedule the first touch."
      else
        days = ((Time.current - last.created_at) / 1.day).floor
        recency = days.zero? ? "today" : "#{days} #{day_label(days)} ago"
        parts << "Last activity #{recency} (#{last.kind}: #{last.subject})."
        parts << "Going stale — no touch in over #{STALE_AFTER_DAYS} days." if days > STALE_AFTER_DAYS
      end

      overdue = overdue_tasks_count
      parts << "#{overdue} overdue #{overdue == 1 ? 'task needs' : 'tasks need'} attention." if overdue.positive?

      parts.join(" ")
    end

    def stale?
      return false if closed?

      last = last_activity
      reference = last&.created_at || @deal.created_at
      reference < STALE_AFTER_DAYS.days.ago
    end

    def closed?
      @deal.closed_at.present? || %w[won lost].include?(@deal.stage&.kind)
    end

    def last_activity
      @last_activity ||= @deal.activities.order(created_at: :desc).first
    end

    def overdue_tasks_count
      @deal.activities.where(kind: :task, completed_at: nil).where("due_at < ?", Time.current).count
    end

    def probability
      @deal.probability || @deal.stage&.probability || 0
    end

    def formatted_amount
      return nil if @deal.amount.nil?

      unit = @deal.currency == "USD" ? "$" : "#{@deal.currency} "
      "#{unit}#{grouped(@deal.amount.to_i)}"
    end

    def weighted_amount
      return nil if @deal.amount.nil?

      unit = @deal.currency == "USD" ? "$" : "#{@deal.currency} "
      weighted = (@deal.amount.to_f * probability / 100).round
      "#{unit}#{grouped(weighted)}"
    end

    def grouped(number)
      number.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
    end

    def date(value)
      value.to_date.iso8601
    end

    def day_label(days)
      days == 1 ? "day" : "days"
    end
  end
end
