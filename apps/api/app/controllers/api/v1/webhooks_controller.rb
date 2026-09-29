class Api::V1::WebhooksController < Api::V1::BaseController
  before_action :set_webhook, only: [:show, :update, :destroy, :deliveries]

  def index
    webhooks = policy_scope(Webhook)
    webhooks = webhooks.order(:created_at)

    paginate(webhooks)
  end

  def show
    authorize @webhook
    render json: @webhook
  end

  def create
    webhook = Webhook.new(webhook_params)
    webhook.account = Current.account
    webhook.secret = SecureRandom.hex(32)
    authorize webhook
    webhook.save!
    render json: webhook, status: :created
  end

  def update
    authorize @webhook
    @webhook.update!(webhook_params)
    render json: @webhook
  end

  def destroy
    authorize @webhook
    @webhook.destroy!
    head :no_content
  end

  def deliveries
    authorize @webhook
    deliveries = @webhook.deliveries.order(:created_at).reverse_order
    paginate(deliveries)
  end

  private

  def set_webhook
    @webhook = Webhook.find(params[:id])
  end

  def webhook_params
    params.require(:webhook).permit(:url, :events, :is_active)
  end
end
