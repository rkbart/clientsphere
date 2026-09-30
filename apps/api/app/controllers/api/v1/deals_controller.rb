class Api::V1::DealsController < Api::V1::BaseController
  before_action :set_deal, only: [:show, :update, :destroy, :move]

  def index
    deals = policy_scope(Deal)
    deals = deals.where(stage_id: params[:stage_id]) if params[:stage_id].present?
    deals = deals.where(pipeline_id: params[:pipeline_id]) if params[:pipeline_id].present?
    deals = deals.joins(:taggings).where(taggings: { tag_id: params[:tag_id] }) if params[:tag_id].present?
    deals = CustomFields::Filter.apply(deals, Current.account, "Deal", params[:custom])
    deals = deals.order(params[:sort] || :position).order(created_at: :asc)

    paginate(deals)
  end

  def show
    authorize @deal
    render json: @deal
  end

  def create
    deal = Deal.new(deal_params)
    deal.account = Current.account
    deal.owner = Current.user
    authorize deal
    deal.save!
    render json: deal, status: :created
  end

  def update
    authorize @deal
    @deal.update!(deal_params)
    render json: @deal
  end

  def destroy
    authorize @deal
    @deal.discard!
    head :no_content
  end

  def move
    authorize @deal
    @deal.move_to!(params[:stage_id], position: params[:position])
    render json: @deal
  end

  private

  def set_deal
    @deal = Deal.find(params[:id])
  end

  def deal_params
    params.require(:deal).permit(:title, :amount, :currency, :pipeline_id, :stage_id, :contact_id, :company_id, :owner_id, :expected_close_date, :probability, :position, :source, custom_data: {})
  end
end
