class Api::V1::TagsController < Api::V1::BaseController
  before_action :set_tag, only: [:destroy]

  def index
    tags = policy_scope(Tag)
    tags = tags.order(:name)

    render json: tags
  end

  def create
    tag = Tag.new(tag_params)
    tag.account = Current.account
    authorize tag
    tag.save!
    render json: tag, status: :created
  end

  def destroy
    authorize @tag
    @tag.destroy!
    head :no_content
  end

  private

  def set_tag
    @tag = Tag.find(params[:id])
  end

  def tag_params
    params.require(:tag).permit(:name, :color)
  end
end
