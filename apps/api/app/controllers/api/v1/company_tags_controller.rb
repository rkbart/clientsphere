class Api::V1::CompanyTagsController < Api::V1::BaseController
  def index
    company = Company.find(params[:company_id])
    authorize company, :show?
    render json: policy_scope(company.tags)
  end

  def create
    company = Company.find(params[:company_id])
    tag = Tag.find(params[:tag_id])
    authorize company
    Tagging.create!(taggable: company, tag: tag, account: Current.account)
    head :no_content
  end

  def destroy
    company = Company.find(params[:company_id])
    tag = Tag.find(params[:tag_id] || params[:id])
    authorize company
    Tagging.find_by!(taggable: company, tag: tag).destroy!
    head :no_content
  end
end
