class CsvImportJob < ApplicationJob
  queue_as :default

  def perform(import_id, account_id, file_path)
    account = Account.find(account_id)
    import = Imports::CsvImporter.new(account, OpenStruct.new(path: file_path))
    import.run!
  end
end
