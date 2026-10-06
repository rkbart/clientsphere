class Api::V1::BaseController < ActionController::API
  include Pundit::Authorization

  before_action :set_current_account_and_user
  after_action :verify_authorized, except: [:index]
  after_action :verify_policy_scoped, only: [:index]

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
  rescue_from ActiveRecord::RecordNotDestroyed, with: :unprocessable_entity
  rescue_from Pundit::NotAuthorizedError, with: :forbidden

  private

  def pundit_user
    Current.user
  end

  def set_current_account_and_user
    token = request.headers["Authorization"]&.split(" ")&.last
    if token&.start_with?("csk_")
      authenticate_api_token(token)
    else
      authenticate_session(token)
    end
    render json: { error: "Unauthorized" }, status: :unauthorized unless Current.user
  end

  def authenticate_session(token)
    session = Session.authenticate(token) if token
    if session
      Current.user = session.user
      # Sessions die with removal, but a request already in flight (or a token
      # issued before the fix) must not operate without a membership either.
      Current.account = session.user.current_account if session.user.memberships.exists?
    end
  end

  # Personal access tokens scope to the token's account (not the user's
  # current account) so integrations stay pinned to one workspace.
  def authenticate_api_token(raw_token)
    api_token = ApiToken.authenticate(raw_token)
    return unless api_token

    api_token.record_usage!
    Current.user = api_token.user
    Current.account = api_token.account
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

  def paginate(collection, include_associations: [])
    page = (params[:page] || 1).to_i
    per_page = [params[:per_page]&.to_i || 25, 100].min

    paginated = collection.page(page).per(per_page)
    includes = include_associations.to_h do |entry|
      assoc, only = entry.is_a?(Hash) ? entry.first : [entry, nil]
      [assoc, { only: only || [:id, :name, :color] }]
    end
    records = includes.any? ? paginated.includes(*includes.keys) : paginated

    render json: {
      data: records.as_json(include: includes),
      meta: {
        current_page: paginated.current_page,
        total_pages: paginated.total_pages,
        total_count: paginated.total_count,
        per_page: per_page
      }
    }
  end
end
