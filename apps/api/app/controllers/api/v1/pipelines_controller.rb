class Api::V1::PipelinesController < Api::V1::BaseController
  before_action :set_pipeline, only: [:show, :update, :destroy]

  def index
    pipelines = policy_scope(Pipeline)
    pipelines = pipelines.order(:created_at)

    paginate(pipelines)
  end

  def show
    authorize @pipeline
    render json: @pipeline
  end

  def create
    pipeline = Pipeline.new(pipeline_params)
    pipeline.account = Current.account
    authorize pipeline
    pipeline.save!
    render json: pipeline, status: :created
  end

  def update
    authorize @pipeline
    @pipeline.update!(pipeline_params)
    render json: @pipeline
  end

  def destroy
    authorize @pipeline
    @pipeline.destroy!
    head :no_content
  end

  private

  def set_pipeline
    @pipeline = Current.account.pipelines.find(params[:id])
  end

  def pipeline_params
    params.require(:pipeline).permit(:name, :is_default)
  end
end
