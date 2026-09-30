module Types
  class QueryType < Types::BaseObject
    field :contacts, Types::ContactType.connection_type, null: false do
      argument :page, Integer, required: false
      argument :per_page, Integer, required: false
      argument :q, String, required: false
      argument :status, String, required: false
    end

    field :contact, Types::ContactType, null: true do
      argument :id, ID, required: true
    end

    field :companies, Types::CompanyType.connection_type, null: false do
      argument :page, Integer, required: false
      argument :per_page, Integer, required: false
      argument :q, String, required: false
    end

    field :company, Types::CompanyType, null: true do
      argument :id, ID, required: true
    end

    field :deals, Types::DealType.connection_type, null: false do
      argument :page, Integer, required: false
      argument :per_page, Integer, required: false
      argument :pipeline_id, ID, required: false
      argument :stage_id, ID, required: false
    end

    field :deal, Types::DealType, null: true do
      argument :id, ID, required: true
    end

    field :activities, Types::ActivityType.connection_type, null: false do
      argument :page, Integer, required: false
      argument :per_page, Integer, required: false
      argument :kind, String, required: false
      argument :completed, Boolean, required: false
    end

    field :activity, Types::ActivityType, null: true do
      argument :id, ID, required: true
    end

    field :current_user, Types::UserType, null: false

    def contacts(page: 1, per_page: 25, query: nil, status: nil)
      scope = Current.account.contacts
      scope = scope.search(query) if query.present?
      scope = scope.where(status: status) if status.present?
      scope.order(:created_at).reverse_order.page(page).per([per_page, 100].min)
    end

    def contact(id:)
      Current.account.contacts.find(id)
    end

    def companies(page: 1, per_page: 25, query: nil)
      scope = Current.account.companies
      scope = scope.where("name ILIKE ?", "%#{query}%") if query.present?
      scope.order(:created_at).reverse_order.page(page).per([per_page, 100].min)
    end

    def company(id:)
      Current.account.companies.find(id)
    end

    def deals(page: 1, per_page: 25, pipeline_id: nil, stage_id: nil)
      scope = Current.account.deals
      scope = scope.where(pipeline_id: pipeline_id) if pipeline_id.present?
      scope = scope.where(stage_id: stage_id) if stage_id.present?
      scope.order(:position).order(created_at: :asc).page(page).per([per_page, 100].min)
    end

    def deal(id:)
      Current.account.deals.find(id)
    end

    def activities(page: 1, per_page: 25, kind: nil, completed: nil)
      scope = Current.account.activities
      scope = scope.where(kind: kind) if kind.present?
      scope = scope.where(completed_at: nil) if completed == false
      scope = scope.where.not(completed_at: nil) if completed == true
      scope.order(:due_at).page(page).per([per_page, 100].min)
    end

    def activity(id:)
      Current.account.activities.find(id)
    end

    def current_user
      Current.user
    end
  end
end
