class DeduplicatePipelineStages < ActiveRecord::Migration[8.1]
  # Historical seeds created a second set of stages alongside the
  # Pipeline#after_create defaults, with two renamed variants.
  SEED_ALIASES = { "New Lead" => "New", "Proposal Sent" => "Proposal" }.freeze

  def up
    Pipeline.find_each do |pipeline|
      SEED_ALIASES.each do |alias_name, canonical_name|
        pipeline.stages.where(name: alias_name).find_each do |stage|
          stage.update_column(:name, canonical_name)
        end
      end

      pipeline.stages.order(:position, :created_at).group_by(&:name).each_value do |dupes|
        next if dupes.one?

        keeper, *rest = dupes
        rest.each do |dupe|
          Deal.where(stage_id: dupe.id).update_all(stage_id: keeper.id)
          dupe.destroy!
        end
      end

      pipeline.stages.order(:position, :created_at).each_with_index do |stage, i|
        stage.update_column(:position, i)
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
