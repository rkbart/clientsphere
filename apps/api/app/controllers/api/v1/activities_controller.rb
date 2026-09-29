class Api::V1::ActivitiesController < Api::V1::BaseController
  before_action :set_activity, only: [:show, :update, :destroy]

  def index
    activities = policy_scope(Activity)
    activities = activities.where(kind: params[:kind]) if params[:kind].present?
    activities = activities.where(assignee_id: params[:assignee_id]) if params[:assignee_id].present?
    activities = activities.where(completed_at: nil) if params[:completed] == "false"
    direction = params[:order] == "desc" ? :desc : :asc
    activities = activities.order((params[:sort] || :due_at) => direction)

    paginate(activities)
  end

  def show
    authorize @activity
    render json: @activity
  end

  def create
    activity = Activity.new(activity_params)
    activity.account = Current.account
    activity.creator = Current.user
    authorize activity
    activity.save!
    render json: activity, status: :created
  end

  def update
    authorize @activity
    @activity.update!(activity_params)
    render json: @activity
  end

  def destroy
    authorize @activity
    @activity.destroy!
    head :no_content
  end

  private

  def set_activity
    @activity = Activity.find(params[:id])
  end

  def activity_params
    params.require(:activity).permit(:kind, :subject, :description, :contact_id, :company_id, :deal_id, :assignee_id, :due_at, :completed_at)
  end
end
