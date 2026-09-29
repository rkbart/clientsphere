class AiEnrichmentJob < ApplicationJob
  queue_as :default

  def perform(company_id)
    company = Company.find(company_id)
    return unless company.domain.present?

    ai_setting = company.account.ai_setting
    return unless ai_setting&.enabled

    result = Ai::Client.new(ai_setting).enrich_company(company.domain)

    if result.is_a?(Hash) && !result["error"]
      company.update!(
        name: result["name"] || company.name,
        industry: result["industry"] || company.industry,
        size_range: result["size_range"] || company.size_range,
        description: result["description"] || company.description
      )
    end
  end
end
