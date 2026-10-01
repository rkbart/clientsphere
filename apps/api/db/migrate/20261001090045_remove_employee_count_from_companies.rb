class RemoveEmployeeCountFromCompanies < ActiveRecord::Migration[8.1]
  def change
    remove_column :companies, :employee_count, :integer
  end
end
