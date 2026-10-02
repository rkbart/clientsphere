class Api::V1::ExportController < Api::V1::BaseController
  def show
    authorize Contact, :bulk_export?

    case params[:type]
    when "contacts"
      send_data Exports::CsvExporter.new(Current.account).contacts, filename: "contacts.csv", type: "text/csv"
    when "companies"
      send_data Exports::CsvExporter.new(Current.account).companies, filename: "companies.csv", type: "text/csv"
    when "deals"
      send_data Exports::CsvExporter.new(Current.account).deals, filename: "deals.csv", type: "text/csv"
    else
      render json: { error: "Invalid export type" }, status: :unprocessable_entity
    end
  end
end
