class Api::V1::ActivitiesController < Api::V1::BaseController
  before_action :set_activity, only: [:show, :update, :destroy]

  def index
    activities = policy_scope(Activity)
    if params[:q].present?
      term = "%#{params[:q]}%"
      activities = activities.where("subject ILIKE :t OR description ILIKE :t", t: term)
    end
    activities = activities.where(kind: params[:kind]) if params[:kind].present? && Activity.kinds.key?(params[:kind])
    activities = activities.where(deal_id: params[:deal_id]) if params[:deal_id].present?
    activities = activities.where(assignee_id: params[:assignee_id]) if params[:assignee_id].present?
    activities = activities.where(completed_at: nil) if params[:completed] == "false"
    activities = activities.where.not(completed_at: nil) if params[:completed] == "true"
    if params[:overdue] == "true"
      activities = activities.where(completed_at: nil).where("due_at < ?", Time.current)
    end
    activities = activities.where("due_at >= ?", params[:due_from]) if params[:due_from].present?
    activities = activities.where("due_at <= ?", params[:due_to]) if params[:due_to].present?
    sort_direction = (params[:direction] || params[:order]) == "desc" ? :desc : :asc
    activities = case params[:sort].to_s
                 when "subject"
                   activities.order(subject: sort_direction, id: sort_direction)
                 when "kind"
                   activities.order(kind: sort_direction, id: sort_direction)
                 when "created_at"
                   activities.order(created_at: sort_direction, id: sort_direction)
                 else
                   activities.order(due_at: sort_direction, id: sort_direction)
                 end

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
