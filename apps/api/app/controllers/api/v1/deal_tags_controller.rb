class Api::V1::DealTagsController < Api::V1::BaseController
  def index
    deal = parent_deal
    authorize deal, :show?
    render json: policy_scope(deal.tags)
  end

  def create
    deal = parent_deal
    tag = parent_tag
    authorize deal
    Tagging.create!(taggable: deal, tag: tag, account: Current.account)
    head :no_content
  end

  def destroy
    deal = parent_deal
    tag = parent_tag
    authorize deal
    Tagging.find_by!(taggable: deal, tag: tag).destroy!
    head :no_content
  end

  private

  # Discarded records behave as deleted: 404 instead of silently re-tagging them.
  def parent_deal
    policy_scope(Deal).kept.find(params[:deal_id])
  end

  def parent_tag
    policy_scope(Tag).find(params[:tag_id] || params[:id])
  end
end
