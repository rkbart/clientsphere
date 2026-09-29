module Leads
  class Scorer
    WEIGHTS = {
      recency: 15,
      activity_count: 10,
      deal_value: 20,
      stage_progress: 15,
      email_engagement: 10,
      missing_fields: -10
    }.freeze

    def initialize(contact)
      @contact = contact
      @score = 0
      @reasons = []
    end

    def call
      score_recency
      score_activity_count
      score_deal_value
      score_stage_progress
      score_email_engagement
      score_missing_fields

      @score = [[@score, 0].max, 100].min

      @contact.update!(
        lead_score: @score,
        score_reasons: @reasons
      )

      @contact
    end

    private

    def score_recency
      last_activity = @contact.activities.order(created_at: :desc).first
      return unless last_activity

      days_since = (Time.current - last_activity.created_at).to_i / 1.day

      if days_since <= 7
        @score += WEIGHTS[:recency]
        @reasons << "Replied within 7 days (+#{WEIGHTS[:recency]})"
      elsif days_since <= 30
        @score += WEIGHTS[:recency] / 2
        @reasons << "Active within 30 days (+#{WEIGHTS[:recency] / 2})"
      else
        @score -= WEIGHTS[:recency]
        @reasons << "No activity in #{days_since} days (−#{WEIGHTS[:recency]})"
      end
    end

    def score_activity_count
      count = @contact.activities.where("created_at > ?", 30.days.ago).count

      if count >= 5
        @score += WEIGHTS[:activity_count]
        @reasons << "#{count} activities in 30 days (+#{WEIGHTS[:activity_count]})"
      elsif count >= 2
        @score += WEIGHTS[:activity_count] / 2
        @reasons << "#{count} activities in 30 days (+#{WEIGHTS[:activity_count] / 2})"
      end
    end

    def score_deal_value
      total = @contact.deals.sum(:amount)
      return if total.zero?

      if total >= 10_000
        @score += WEIGHTS[:deal_value]
        @reasons << "High deal value ($#{total}) (+#{WEIGHTS[:deal_value]})"
      elsif total >= 1_000
        @score += WEIGHTS[:deal_value] / 2
        @reasons << "Medium deal value ($#{total}) (+#{WEIGHTS[:deal_value] / 2})"
      end
    end

    def score_stage_progress
      deals = @contact.deals.includes(:stage)
      return if deals.empty?

      won_count = deals.count { |d| d.stage.kind == "won" }
      if won_count > 0
        @score += WEIGHTS[:stage_progress]
        @reasons << "Won #{won_count} deal(s) (+#{WEIGHTS[:stage_progress]})"
      end
    end

    def score_email_engagement
      emails = @contact.emails.where(direction: :outbound)
      return if emails.empty?

      opened = emails.where.not(opened_at: nil).count
      rate = opened.to_f / emails.count

      if rate >= 0.5
        @score += WEIGHTS[:email_engagement]
        @reasons << "High email engagement (#{(rate * 100).to_i}%) (+#{WEIGHTS[:email_engagement]})"
      end
    end

    def score_missing_fields
      missing = []
      missing << "email" if @contact.email.blank?
      missing << "phone" if @contact.phone.blank?
      missing << "company" if @contact.company_id.blank?

      if missing.any?
        @score += WEIGHTS[:missing_fields] * missing.count
        @reasons << "Missing #{missing.join(', ')} (#{WEIGHTS[:missing_fields] * missing.count})"
      end
    end
  end
end
