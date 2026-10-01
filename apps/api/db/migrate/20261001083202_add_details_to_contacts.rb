class AddDetailsToContacts < ActiveRecord::Migration[8.1]
  def change
    add_column :contacts, :job_title, :string
    add_column :contacts, :city, :string
    add_column :contacts, :social_links, :jsonb, default: [], null: false
  end
end
