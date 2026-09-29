class Api::V1::ContactTagsController < Api::V1::BaseController
  def create
    contact = Contact.find(params[:contact_id])
    tag = Tag.find(params[:tag_id])
    authorize contact
    Tagging.create!(taggable: contact, tag: tag, account: Current.account)
    head :no_content
  end

  def destroy
    contact = Contact.find(params[:contact_id])
    tag = Tag.find(params[:tag_id])
    authorize contact
    Tagging.find_by!(taggable: contact, tag: tag).destroy!
    head :no_content
  end
end
