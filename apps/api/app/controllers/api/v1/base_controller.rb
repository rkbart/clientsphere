class Api::V1::BaseController < ActionController::API
  include Pundit::Authorization

  before_action :set_current_account_and_user
  after_action :verify_authorized, except: [:index]
  after_action :verify_policy_scoped, only: [:index]

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
  rescue_from Pundit::NotAuthorizedError, with: :forbidden

  private

  def pundit_user
    Current.user
  end

  def set_current_account_and_user
    token = request.headers["Authorization"]&.split(" ")&.last
    session = Session.authenticate(token) if token
    if session
      Current.user = session.user
      Current.account = session.user.current_account
    end
    render json: { error: "Unauthorized" }, status: :unauthorized unless Current.user
  end

  def not_found
    render json: { error: "Not found" }, status: :not_found
  end

  def unprocessable_entity(exception)
    render json: { error: exception.record.errors.full_messages }, status: :unprocessable_entity
  end

  def forbidden
    render json: { error: "Forbidden" }, status: :forbidden
  end

  def paginate(collection)
    page = (params[:page] || 1).to_i
    per_page = [params[:per_page]&.to_i || 25, 100].min

    paginated = collection.page(page).per(per_page)

    render json: {
      data: paginated,
      meta: {
        current_page: paginated.current_page,
        total_pages: paginated.total_pages,
        total_count: paginated.total_count,
        per_page: per_page
      }
    }
  end
end
