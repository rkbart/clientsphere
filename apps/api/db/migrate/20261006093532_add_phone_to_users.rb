class AddPhoneToUsers < ActiveRecord::Migration[8.1]
  def change
    # Optional contact info collected during first-login onboarding.
    add_column :users, :phone, :string
  end
end
