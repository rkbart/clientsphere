class AddAddressesToContactsAndCompanies < ActiveRecord::Migration[8.1]
  def change
    add_column :contacts, :billing_address, :jsonb, default: {}, null: false
    add_column :contacts, :shipping_address, :jsonb, default: {}, null: false
    add_column :companies, :billing_address, :jsonb, default: {}, null: false
    add_column :companies, :shipping_address, :jsonb, default: {}, null: false
  end
end
