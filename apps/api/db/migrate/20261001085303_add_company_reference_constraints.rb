class AddCompanyReferenceConstraints < ActiveRecord::Migration[8.1]
  def change
    add_index :companies, :added_by_id
    add_index :companies, :main_contact_id
    add_foreign_key :companies, :users, column: :added_by_id
    add_foreign_key :companies, :contacts, column: :main_contact_id
  end
end
