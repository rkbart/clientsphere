class GraphqlController < ActionController::API
  before_action :authenticate_graphql_user

  def execute
    result = ClientSphereSchema.execute(
      params[:query],
      variables: ensure_hash(params[:variables]),
      context: { current_user: Current.user, current_account: Current.account },
      operation_name: params[:operationName]
    )
    render json: result
  rescue StandardError => e
    raise e unless Rails.env.development?
    handle_error_in_development(e)
  end

  private

  def authenticate_graphql_user
    token = request.headers["Authorization"]&.split(" ")&.last
    if token&.start_with?("csk_")
      api_token = ApiToken.authenticate(token)
      if api_token
        Current.user = api_token.user
        Current.account = api_token.account
        return
      end
    else
      session = Session.authenticate(token) if token
      if session
        Current.user = session.user
        Current.account = session.user.current_account
        return
      end
    end
    render json: { errors: [{ message: "Unauthorized" }] }, status: :unauthorized
  end

  def ensure_hash(ambiguous_param)
    case ambiguous_param
    when String
      if ambiguous_param.present?
        JSON.parse(ambiguous_param)
      else
        {}
      end
    when Hash, ActionController::Parameters
      ambiguous_param
    when nil
      {}
    else
      raise ArgumentError, "Unexpected parameter: #{ambiguous_param}"
    end
  end

  def handle_error_in_development(error)
    logger.error error.message
    logger.error error.backtrace.join("\n")

    render json: { errors: [{ message: error.message, backtrace: error.backtrace }], data: {} },
           status: 500
  end
end
