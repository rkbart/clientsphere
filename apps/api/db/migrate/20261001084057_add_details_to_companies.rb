class AddDetailsToCompanies < ActiveRecord::Migration[8.1]
  def change
    add_column :companies, :address, :string
    add_column :companies, :employee_count, :integer
    add_column :companies, :social_links, :jsonb, default: [], null: false
    # Plain uuid columns without foreign keys or indexes: the app role
    # lacks CREATE on the public schema, so constraints/indexes can't be
    # added here. Integrity is enforced by model validations instead.
    add_column :companies, :added_by_id, :uuid
    add_column :companies, :main_contact_id, :uuid
  end
end
