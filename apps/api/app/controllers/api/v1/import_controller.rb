class Api::V1::ImportController < Api::V1::BaseController
  def create
    authorize Contact, :bulk_import?
    mapping = params[:mapping].present? ? JSON.parse(params[:mapping].to_s) : {}
    dedupe = %w[skip update].include?(params[:dedupe]) ? params[:dedupe] : "skip"
    import = Imports::CsvImporter.new(Current.account, params[:file], mapping: mapping, dedupe: dedupe)
    import.run!
    render json: import.summary
  rescue JSON::ParserError
    render json: { error: "mapping must be valid JSON" }, status: :unprocessable_entity
  end
end
