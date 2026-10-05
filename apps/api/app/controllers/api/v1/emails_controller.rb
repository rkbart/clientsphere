class Api::V1::EmailsController < Api::V1::BaseController
  before_action :set_email, only: [:show, :update, :destroy]

  def index
    emails = policy_scope(Email)
    emails = emails.where(contact_id: params[:contact_id]) if params[:contact_id].present?
    emails = emails.where(deal_id: params[:deal_id]) if params[:deal_id].present?
    emails = emails.where(status: params[:status]) if params[:status].present? && Email.statuses.key?(params[:status])
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

  def redeliver
    email = Current.account.emails.find(params[:id])
    authorize email, :update?

    render json: EmailService.redeliver(email)
  end

  def templates
    skip_authorization
    contact = Current.account.contacts.kept.find_by(id: params[:contact_id]) if params[:contact_id].present?

    render json: Emails::Templates.all.map { |t|
      next t unless contact

      t.merge(
        subject: EmailService.interpolate(t[:subject], contact),
        body: EmailService.interpolate(t[:body], contact)
      )
    }
  end

  # A contact is optional: deals can be composed to without one, in which case
  # the caller supplies the recipient addresses directly.
  def deliver
    contact = Current.account.contacts.kept.find(params[:contact_id]) if params[:contact_id].present?
    deal = Current.account.deals.find(params[:deal_id]) if params[:deal_id].present?
    authorize Email.new(account: Current.account), :create?
    recipients = params.permit(to_addresses: [], cc_addresses: [], bcc_addresses: [])
    to_addresses = Array(recipients[:to_addresses]).compact_blank

    if contact.nil? && to_addresses.empty?
      message = "Provide a contact or at least one recipient address."
      return render json: { error: message }, status: :unprocessable_entity
    end

    email = EmailService.send_email(
      account: Current.account,
      contact: contact,
      deal: deal,
      subject: params[:subject].to_s,
      body: params[:body].to_s,
      to_addresses: to_addresses,
      cc_addresses: Array(recipients[:cc_addresses]),
      bcc_addresses: Array(recipients[:bcc_addresses])
    )
    render json: email, status: :created
  end

  private

  def set_email
    @email = Email.find(params[:id])
  end

  def email_params
    params.require(:email).permit(:direction, :from_address, :subject, :body, :contact_id, :deal_id, :status, :sent_at, :opened_at, to_addresses: [], cc_addresses: [], bcc_addresses: [])
  end
end
