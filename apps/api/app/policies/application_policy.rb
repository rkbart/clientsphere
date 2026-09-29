class ApplicationPolicy
  attr_reader :user, :account, :record

  def initialize(user, record)
    @user = user
    @account = user.current_account
    @record = record
    verify_account_scope!
  end

  def index?
    true
  end

  def show?
    true
  end

  def create?
    owner_or_admin?
  end

  def update?
    owner_or_admin?
  end

  def destroy?
    owner_or_admin?
  end

  class Scope
    def initialize(user, scope)
      @user = user
      @account = user.current_account
      @scope = scope
    end

    def resolve
      @scope.where(account: @account)
    end
  end

  private

  # Cross-tenant guard: every record-based authorization must belong to the
  # caller's account (index/list actions go through policy_scope instead).
  def verify_account_scope!
    return unless @record.is_a?(ApplicationRecord)
    return unless @record.respond_to?(:account_id)
    return if @record.account_id.nil? || @record.account_id == @account&.id

    raise Pundit::NotAuthorizedError, "record belongs to another account"
  end

  def owner_or_admin?
    role = user.role_for(account)
    role == "owner" || role == "admin"
  end

  def member_or_above?
    role = user.role_for(account)
    ["owner", "admin", "member"].include?(role)
  end

  def viewer_or_above?
    true
  end
end
