class Api::V1::CompaniesController < Api::V1::BaseController
  before_action :set_company, only: [:show, :update, :destroy]

  def index
    companies = policy_scope(Company).kept
    if params[:q].present?
      term = "%#{params[:q]}%"
      companies = companies.where("name ILIKE :t OR domain ILIKE :t OR industry ILIKE :t", t: term)
    end
    companies = CustomFields::Filter.apply(companies, Current.account, "Company", params[:custom])

    sort_direction = params[:direction] == "desc" ? :desc : :asc
    companies = case params[:sort].to_s
                when "domain"
                  companies.order(domain: sort_direction, id: sort_direction)
                when "industry"
                  companies.order(industry: sort_direction, id: sort_direction)
                when "annual_revenue"
                  companies.order(annual_revenue: sort_direction, id: sort_direction)
                else
                  companies.order(name: sort_direction, id: sort_direction)
                end

    paginate(companies, include_associations: [:tags])
  end

  def show
    authorize @company
    render json: @company.as_json(include: { tags: { only: [:id, :name, :color] } })
  end

  def create
    company = Company.new(company_params)
    company.account = Current.account
    company.owner = Current.user
    authorize company
    company.save!
    render json: company, status: :created
  end

  def update
    authorize @company
    @company.update!(company_params)
    render json: @company
  end

  def destroy
    authorize @company
    @company.discard!
    head :no_content
  end

  private

  def set_company
    @company = policy_scope(Company).kept.find(params[:id])
  end

  def company_params
    params.require(:company).permit(:name, :domain, :industry, :size_range, :annual_revenue, :description, :owner_id, custom_data: {})
  end
end
