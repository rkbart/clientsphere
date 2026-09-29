module Ai
  # Assembles the account-scoped context sent with chat requests. Selection is
  # keyword-driven (records matching the question) with a recent-first fallback,
  # always bounded so prompts stay small.
  class Context
    POOL_LIMIT = 100
    MATCH_LIMIT = 5

    def initialize(account, message)
      @account = account
      @terms = message.to_s.downcase.scan(/[a-z0-9]+/).select { |t| t.length >= 3 }.uniq.first(6)
    end

    def chat
      {
        contacts: contacts,
        deals: deals,
        due_tasks: due_tasks,
        totals: totals
      }
    end

    private

    def contacts
      pool = @account.contacts.order(created_at: :desc).limit(POOL_LIMIT).to_a
      matches = pool.select { |contact| term_match?(contact.full_name.downcase, contact.email.to_s.downcase) }
      (matches.presence || pool).first(MATCH_LIMIT).map { |contact| Prompts.contact_payload(contact) }
    end

    def deals
      pool = @account.deals.where(closed_at: nil).order(created_at: :desc).limit(POOL_LIMIT).to_a
      matches = pool.select { |deal| term_match?(deal.title.to_s.downcase) }
      (matches.presence || pool).first(MATCH_LIMIT).map { |deal| Prompts.deal_payload(deal) }
    end

    def due_tasks
      Prompts.activity_list(
        @account.activities.where(kind: :task, completed_at: nil).order(due_at: :asc).limit(MATCH_LIMIT)
      )
    end

    def totals
      {
        contacts: @account.contacts.count,
        open_deals: @account.deals.where(closed_at: nil).count,
        open_deal_value: @account.deals.where(closed_at: nil).sum(:amount).to_f,
        open_tasks: @account.activities.where(kind: :task, completed_at: nil).count
      }
    end

    def term_match?(*fields)
      return false if @terms.empty?

      @terms.any? { |term| fields.any? { |field| field.include?(term) } }
    end
  end
end
