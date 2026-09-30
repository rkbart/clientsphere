class Api::V1::CompanyTagsController < Api::V1::BaseController
  def index
    company = parent_company
    authorize company, :show?
    render json: policy_scope(company.tags)
  end

  def create
    company = parent_company
    tag = parent_tag
    authorize company
    Tagging.create!(taggable: company, tag: tag, account: Current.account)
    head :no_content
  end

  def destroy
    company = parent_company
    tag = parent_tag
    authorize company
    Tagging.find_by!(taggable: company, tag: tag).destroy!
    head :no_content
  end

  private

  # Discarded records behave as deleted: 404 instead of silently re-tagging them.
  def parent_company
    policy_scope(Company).kept.find(params[:company_id])
  end

  def parent_tag
    policy_scope(Tag).find(params[:tag_id] || params[:id])
  end
end
