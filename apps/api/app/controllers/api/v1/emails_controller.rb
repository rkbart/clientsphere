class Api::V1::EmailsController < Api::V1::BaseController
  before_action :set_email, only: [:show, :update, :destroy]

  def index
    emails = policy_scope(Email)
    emails = emails.where(contact_id: params[:contact_id]) if params[:contact_id].present?
    emails = emails.where(deal_id: params[:deal_id]) if params[:deal_id].present?
    emails = emails.order(:created_at).reverse_order

    paginate(emails)
  end

  def show
    authorize @email
    render json: @email
  end

  def create
    email = Email.new(email_params)
    email.account = Current.account
    authorize email
    email.save!
    render json: email, status: :created
  end

  def update
    authorize @email
    @email.update!(email_params)
    render json: @email
  end

  def destroy
    authorize @email
    @email.destroy!
    head :no_content
  end

  private

  def set_email
    @email = Email.find(params[:id])
  end

  def email_params
    params.require(:email).permit(:direction, :from_address, :to_addresses, :subject, :body, :contact_id, :deal_id, :status, :sent_at, :opened_at)
  end
end
