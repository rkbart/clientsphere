class Api::V1::ContactTagsController < Api::V1::BaseController
  def index
    contact = parent_contact
    authorize contact, :show?
    render json: policy_scope(contact.tags)
  end

  def create
    contact = parent_contact
    tag = parent_tag
    authorize contact
    Tagging.create!(taggable: contact, tag: tag, account: Current.account)
    head :no_content
  end

  def destroy
    contact = parent_contact
    tag = parent_tag
    authorize contact
    Tagging.find_by!(taggable: contact, tag: tag).destroy!
    head :no_content
  end

  private

  # Discarded records behave as deleted: 404 instead of silently re-tagging them.
  def parent_contact
    policy_scope(Contact).kept.find(params[:contact_id])
  end

  def parent_tag
    policy_scope(Tag).find(params[:tag_id] || params[:id])
  end
end
