class ChangeDealProbabilityDefault < ActiveRecord::Migration[8.1]
  # NULL means "follow the stage" so new deals auto-populate from their
  # stage instead of sticking at the old 0 default. Existing rows keep
  # their values.
  def change
    change_column_default :deals, :probability, from: 0, to: nil
  end
end
