class Api::V1::ImportController < Api::V1::BaseController
  def create
    authorize Contact
    import = Imports::CsvImporter.new(Current.account, params[:file])
    import.run!
    render json: { import_id: import.id, status: import.status }, status: :accepted
  end

  def show
    import = Imports::CsvImporter.find(params[:id])
    authorize import
    render json: import
  end
end
