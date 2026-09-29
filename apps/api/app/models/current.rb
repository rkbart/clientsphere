class Current < ActiveSupport::CurrentAttributes
  attribute :account, :user

  def account=(account)
    super
    ActsAsTenant.current_tenant = account
  end

  def user=(user)
    super
    self.account = user.current_account if user && user.current_account
  end
end
