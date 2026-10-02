class Api::V1::DealsController < Api::V1::BaseController
  before_action :set_deal, only: [:show, :update, :destroy, :move, :summary]

  def index
    deals = policy_scope(Deal).kept
    deals = deals.where("title ILIKE ?", "%#{params[:q]}%") if params[:q].present?
    deals = deals.where(stage_id: params[:stage_id]) if params[:stage_id].present?
    deals = deals.where(pipeline_id: params[:pipeline_id]) if params[:pipeline_id].present?
    deals = deals.joins(:taggings).where(taggings: { tag_id: params[:tag_id] }) if params[:tag_id].present?
    deals = CustomFields::Filter.apply(deals, Current.account, "Deal", params[:custom])

    sort_direction = params[:direction] == "desc" ? :desc : :asc
    deals = case params[:sort].to_s
            when "title"
              deals.order(title: sort_direction, id: sort_direction)
            when "amount"
              deals.order(amount: sort_direction, id: sort_direction)
            when "expected_close_date"
              deals.order(expected_close_date: sort_direction, id: sort_direction)
            else
              deals.order(position: :asc, created_at: :asc)
            end

    paginate(deals, include_associations: [:stage, :company, :tags])
  end

  def show
    authorize @deal
    render json: @deal.as_json(
      include: {
        stage: { only: [:id, :name, :color, :kind] },
        company: { only: [:id, :name] },
        tags: { only: [:id, :name, :color] }
      }
    )
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

  def summary
    authorize @deal
    render json: Deals::Summary.call(@deal)
  end

  def attention
    authorize Deal, :index?
    deals = policy_scope(Deal)
    deals = deals.where(pipeline_id: params[:pipeline_id]) if params[:pipeline_id].present?
    entry = Deals::Attention.call(deals)
    return render json: { deal: nil } if entry.nil?

    deal = entry[:deal]
    render json: {
      deal: {
        id: deal.id,
        title: deal.title,
        amount: deal.amount,
        currency: deal.currency,
        stage: deal.stage && { id: deal.stage.id, name: deal.stage.name }
      },
      score: entry[:score],
      stale: entry[:stale],
      reasons: entry[:reasons]
    }
  end

  private

  def set_deal
    @deal = policy_scope(Deal).kept.find(params[:id])
  end

  def deal_params
    params.require(:deal).permit(:title, :amount, :currency, :pipeline_id, :stage_id, :contact_id, :company_id, :owner_id, :expected_close_date, :probability, :position, :source, custom_data: {})
  end
end
