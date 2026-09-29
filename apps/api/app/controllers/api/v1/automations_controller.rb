class Api::V1::AutomationsController < Api::V1::BaseController
  before_action :set_automation, only: [:show, :update, :destroy, :toggle, :runs]

  def index
    automations = policy_scope(Automation)
    automations = automations.order(:created_at)

    paginate(automations)
  end

  def show
    authorize @automation
    render json: @automation
  end

  def create
    automation = Automation.new(automation_params)
    automation.account = Current.account
    authorize automation
    automation.save!
    render json: automation, status: :created
  end

  def update
    authorize @automation
    @automation.update!(automation_params)
    render json: @automation
  end

  def destroy
    authorize @automation
    @automation.destroy!
    head :no_content
  end

  def toggle
    authorize @automation
    @automation.update!(is_active: !@automation.is_active)
    render json: @automation
  end

  def runs
    authorize @automation
    runs = @automation.automation_runs.order(:created_at).reverse_order
    paginate(runs)
  end

  private

  def set_automation
    @automation = Automation.find(params[:id])
  end

  def automation_params
    params.require(:automation).permit(:name, :trigger_type, :trigger_config, :conditions, :actions, :is_active)
  end
end
