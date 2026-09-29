class AiSettingPolicy < ApplicationPolicy
  def settings?
    member_or_above?
  end

  def update_settings?
    owner_or_admin?
  end

  def test_connection?
    owner_or_admin?
  end

  def chat?
    member_or_above?
  end

  def prompts?
    member_or_above?
  end

  def draft_email?
    member_or_above?
  end

  def suggest_next_action?
    member_or_above?
  end

  def enrich?
    member_or_above?
  end

  def summarize_deal?
    member_or_above?
  end

  class Scope < Scope
    def resolve
      super
    end
  end
end
