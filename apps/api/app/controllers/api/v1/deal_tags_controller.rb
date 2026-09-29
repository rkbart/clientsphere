class Api::V1::DealTagsController < Api::V1::BaseController
  def index
    deal = Deal.find(params[:deal_id])
    authorize deal, :show?
    render json: policy_scope(deal.tags)
  end

  def create
    deal = Deal.find(params[:deal_id])
    tag = Tag.find(params[:tag_id])
    authorize deal
    Tagging.create!(taggable: deal, tag: tag, account: Current.account)
    head :no_content
  end

  def destroy
    deal = Deal.find(params[:deal_id])
    tag = Tag.find(params[:tag_id] || params[:id])
    authorize deal
    Tagging.find_by!(taggable: deal, tag: tag).destroy!
    head :no_content
  end
end
