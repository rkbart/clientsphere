class Api::V1::EmailSequenceStepsController < Api::V1::BaseController
  before_action :set_email_sequence
  before_action :set_step, only: [:show, :update, :destroy]

  def index
    steps = @email_sequence.steps
    render json: steps
  end

  def show
    render json: @step
  end

  def create
    step = @email_sequence.steps.new(step_params)
    authorize step
    step.save!
    render json: step, status: :created
  end

  def update
    authorize @step
    @step.update!(step_params)
    render json: @step
  end

  def destroy
    authorize @step
    @step.destroy!
    head :no_content
  end

  private

  def set_email_sequence
    @email_sequence = EmailSequence.find(params[:email_sequence_id])
  end

  def set_step
    @step = @email_sequence.steps.find(params[:id])
  end

  def step_params
    params.require(:email_sequence_step).permit(:step_order, :delay_days, :subject, :body)
  end
end
