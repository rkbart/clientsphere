class Api::V1::StagesController < Api::V1::BaseController
  before_action :set_pipeline
  before_action :set_stage, only: [:update, :destroy]

  def index
    stages = policy_scope(@pipeline.stages)
    render json: stages
  end

  def create
    stage = @pipeline.stages.new(stage_params)
    authorize stage
    stage.save!
    render json: stage, status: :created
  end

  def update
    authorize @stage
    @stage.update!(stage_params)
    render json: @stage
  end

  def destroy
    authorize @stage
    @stage.destroy!
    head :no_content
  end

  private

  def set_pipeline
    @pipeline = Current.account.pipelines.find(params[:pipeline_id])
  end

  def set_stage
    @stage = @pipeline.stages.find(params[:id])
  end

  def stage_params
    params.require(:stage).permit(:name, :position, :color, :probability, :kind)
  end
end
