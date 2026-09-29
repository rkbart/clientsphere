class Api::V1::CompanyTagsController < Api::V1::BaseController
  def create
    company = Company.find(params[:company_id])
    tag = Tag.find(params[:tag_id])
    authorize company
    Tagging.create!(taggable: company, tag: tag, account: Current.account)
    head :no_content
  end

  def destroy
    company = Company.find(params[:company_id])
    tag = Tag.find(params[:tag_id])
    authorize company
    Tagging.find_by!(taggable: company, tag: tag).destroy!
    head :no_content
  end
end
