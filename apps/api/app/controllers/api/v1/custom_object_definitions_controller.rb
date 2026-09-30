class Api::V1::CustomObjectDefinitionsController < Api::V1::BaseController
  def index
    definitions = policy_scope(CustomObjectDefinition).order(:name)
    render json: definitions
  end

  def show
    definition = Current.account.custom_object_definitions.find(params[:id])
    authorize definition
    render json: definition
  end

  def create
    definition = Current.account.custom_object_definitions.new(definition_params)
    authorize definition
    definition.save!
    render json: definition, status: :created
  end

  def update
    definition = Current.account.custom_object_definitions.find(params[:id])
    authorize definition
    definition.update!(definition_params)
    render json: definition
  end

  def destroy
    definition = Current.account.custom_object_definitions.find(params[:id])
    authorize definition
    definition.destroy!
    head :no_content
  end

  private

  def definition_params
    params.require(:custom_object_definition).permit(:name, :icon, fields: [:name, :type, :required])
  end
end
