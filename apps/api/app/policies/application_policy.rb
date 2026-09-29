class ApplicationPolicy
  attr_reader :user, :account, :record

  def initialize(user, record)
    @user = user
    @account = user.current_account
    @record = record
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
