class Api::V1::CompaniesController < Api::V1::BaseController
  before_action :set_company, only: [:show, :update, :destroy]

  def index
    companies = policy_scope(Company)
    companies = companies.where("name ILIKE ?", "%#{params[:q]}%") if params[:q].present?
    companies = CustomFields::Filter.apply(companies, Current.account, "Company", params[:custom])
    companies = companies.order(params[:sort] || :created_at).reverse_order

    paginate(companies)
  end

  def show
    authorize @company
    render json: @company
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
    @company = Company.find(params[:id])
  end

  def company_params
    params.require(:company).permit(:name, :domain, :industry, :size_range, :annual_revenue, :description, :owner_id, custom_data: {})
  end
end
