module Automations
  class Engine
    def initialize(automation)
      @automation = automation
    end

    def trigger(event_type, record)
      return unless @automation.is_active
      return unless @automation.trigger_type == event_type.to_s

      if conditions_met?(record)
        execute_actions(record)
      end
    end

    private

    def conditions_met?(record)
      conditions = @automation.conditions || {}
      return true if conditions.empty?

      conditions.all? do |key, value|
        case key
        when "min_amount"
          record.respond_to?(:amount) && record.amount >= value.to_f
        when "status"
          record.respond_to?(:status) && record.status == value
        when "tag"
          record.respond_to?(:tags) && record.tags.exists?(name: value)
        else
          true
        end
      end
    end

    def execute_actions(record)
      run = @automation.automation_runs.create!(
        account_id: @automation.account_id,
        status: :running,
        trigger_data: { record_type: record.class.name, record_id: record.id }
      )

      (@automation.actions || {}).each do |action|
        case action["type"]
        when "create_task"
          create_task(record, action)
        when "send_email"
          send_email(record, action)
        when "add_tag"
          add_tag(record, action)
        when "move_stage"
          move_stage(record, action)
        when "call_webhook"
          call_webhook(record, action)
        end
      end

      run.update!(status: :completed, ran_at: Time.current)
    rescue => e
      run.update!(status: :failed, result: { error: e.message })
    end

    def create_task(record, action)
      Activity.create!(
        account: @automation.account,
        kind: :task,
        subject: action["subject"],
        description: action["description"],
        contact_id: record.is_a?(Contact) ? record.id : nil,
        deal_id: record.is_a?(Deal) ? record.id : nil,
        creator_id: task_creator_id(record),
        due_at: action["due_days"]&.days&.from_now || 1.day.from_now
      )
    end

    def task_creator_id(record)
      return record.creator_id if record.respond_to?(:creator_id) && record.creator_id.present?

      @automation.account.memberships.find_by(role: :owner)&.user_id ||
        @automation.account.users.first&.id
    end

    def send_email(record, action)
      contact =
        if record.is_a?(Contact)
          record
        elsif record.respond_to?(:contact)
          record.contact
        end
      return unless contact

      EmailService.send_email(
        account: @automation.account,
        contact: contact,
        deal: record.is_a?(Deal) ? record : nil,
        subject: action["subject"].to_s,
        body: action["body"].to_s
      )
    end

    def add_tag(record, action)
      return unless record.respond_to?(:tags)
      tag = @automation.account.tags.find_or_create_by!(name: action["tag_name"])
      record.tags << tag unless record.tags.include?(tag)
    end

    def move_stage(record, action)
      return unless record.is_a?(Deal)
      stage = @automation.account.stages.find(action["stage_id"])
      record.update!(stage: stage)
    end

    def call_webhook(record, action)
      webhook = @automation.account.webhooks.find(action["webhook_id"])
      Webhooks::Deliverer.new(webhook).deliver(event: "automation.executed", data: record)
    end
  end
end
