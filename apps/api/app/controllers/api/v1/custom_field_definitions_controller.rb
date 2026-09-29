class Api::V1::CustomFieldDefinitionsController < Api::V1::BaseController
  before_action :set_custom_field_definition, only: [:show, :update, :destroy]

  def index
    custom_field_definitions = policy_scope(CustomFieldDefinition)
    custom_field_definitions = custom_field_definitions.where(entity_type: params[:entity_type]) if params[:entity_type].present?
    custom_field_definitions = custom_field_definitions.order(:position)

    render json: custom_field_definitions
  end

  def show
    authorize @custom_field_definition
    render json: @custom_field_definition
  end

  def create
    custom_field_definition = CustomFieldDefinition.new(custom_field_definition_params)
    custom_field_definition.account = Current.account
    authorize custom_field_definition
    custom_field_definition.save!
    render json: custom_field_definition, status: :created
  end

  def update
    authorize @custom_field_definition
    @custom_field_definition.update!(custom_field_definition_params)
    render json: @custom_field_definition
  end

  def destroy
    authorize @custom_field_definition
    @custom_field_definition.destroy!
    head :no_content
  end

  private

  def set_custom_field_definition
    @custom_field_definition = CustomFieldDefinition.find(params[:id])
  end

  def custom_field_definition_params
    params.require(:custom_field_definition).permit(:entity_type, :key, :label, :field_type, :options, :required, :position)
  end
end
