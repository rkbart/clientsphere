class Api::V1::CustomObjectRecordsController < Api::V1::BaseController
  def index
    definition = Current.account.custom_object_definitions.find(params[:custom_object_definition_id])
    records = policy_scope(CustomObjectRecord).where(custom_object_definition: definition).order(:created_at).reverse_order
    paginate(records)
  end

  def show
    record = Current.account.custom_object_records.find(params[:id])
    authorize record
    render json: record
  end

  def create
    definition = Current.account.custom_object_definitions.find(params[:custom_object_definition_id])
    record = definition.records.new(record_params)
    record.account = Current.account
    authorize record
    record.save!
    render json: record, status: :created
  end

  def update
    record = Current.account.custom_object_records.find(params[:id])
    authorize record
    record.update!(record_params)
    render json: record
  end

  def destroy
    record = Current.account.custom_object_records.find(params[:id])
    authorize record
    record.destroy!
    head :no_content
  end

  private

  def record_params
    params.require(:custom_object_record).permit(data: {})
  end
end
