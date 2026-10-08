class AddAddressToContacts < ActiveRecord::Migration[8.1]
  def change
    add_column :contacts, :address, :string
  end
end
