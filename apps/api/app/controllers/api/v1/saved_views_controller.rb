class Api::V1::SavedViewsController < Api::V1::BaseController
  before_action :set_saved_view, only: [:show, :update, :destroy]

  def index
    saved_views = policy_scope(SavedView)
    saved_views = saved_views.where(entity_type: params[:entity_type]) if params[:entity_type].present?
    saved_views = saved_views.order(:name)

    render json: saved_views
  end

  def show
    authorize @saved_view
    render json: @saved_view
  end

  def create
    saved_view = SavedView.new(saved_view_params)
    saved_view.account = Current.account
    saved_view.user = Current.user
    authorize saved_view
    saved_view.save!
    render json: saved_view, status: :created
  end

  def update
    authorize @saved_view
    @saved_view.update!(saved_view_params)
    render json: @saved_view
  end

  def destroy
    authorize @saved_view
    @saved_view.destroy!
    head :no_content
  end

  private

  def set_saved_view
    @saved_view = SavedView.find(params[:id])
  end

  def saved_view_params
    params.require(:saved_view).permit(:entity_type, :name, :shared, filters: {}, sort: {}, columns: {})
  end
end
