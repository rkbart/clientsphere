class AddSourceToDeals < ActiveRecord::Migration[8.1]
  def change
    add_column :deals, :source, :string
  end
end
