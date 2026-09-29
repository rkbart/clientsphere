class Api::V1::ContactsController < Api::V1::BaseController
  before_action :set_contact, only: [:show, :update, :destroy, :export, :erase, :score]
  before_action :validate_contact_status, only: [:create, :update]

  def index
    contacts = policy_scope(Contact)
    contacts = contacts.search(params[:q]) if params[:q].present?
    if params[:status].present?
      unless Contact.statuses.key?(params[:status])
        return render json: { error: "status must be one of: #{Contact.statuses.keys.join(', ')}" },
                      status: :unprocessable_entity
      end

      contacts = contacts.where(status: params[:status])
    end
    contacts = contacts.joins(:taggings).where(taggings: { tag_id: params[:tag_id] }) if params[:tag_id].present?
    contacts = contacts.order(params[:sort] || :created_at).reverse_order

    paginate(contacts)
  end

  def show
    authorize @contact
    render json: @contact
  end

  def create
    contact = Contact.new(contact_params)
    contact.account = Current.account
    contact.owner = Current.user
    authorize contact
    contact.save!
    render json: contact, status: :created
  end

  def update
    authorize @contact
    @contact.update!(contact_params)
    render json: @contact
  end

  def destroy
    authorize @contact
    @contact.discard!
    head :no_content
  end

  def export
    authorize @contact
    send_data generate_csv(@contact), filename: "contact-#{@contact.id}.csv", type: "text/csv"
  end

  def erase
    authorize @contact
    @contact.destroy!
    head :no_content
  end

  def score
    authorize @contact
    @contact.score!
    render json: @contact
  end

  def import
    authorize Contact
    import = Imports::CsvImporter.new(Current.account, params[:file])
    import.run!
    render json: { import_id: import.id, status: import.status }, status: :accepted
  end

  private

  def set_contact
    @contact = Contact.find(params[:id])
  end

  def validate_contact_status
    status = params.dig(:contact, :status)
    return if status.blank? || Contact.statuses.key?(status)

    render json: { error: "status must be one of: #{Contact.statuses.keys.join(', ')}" },
           status: :unprocessable_entity
  end

  def contact_params
    params.require(:contact).permit(:first_name, :last_name, :email, :phone, :company_id, :owner_id, :status, :source)
  end

  def generate_csv(contact)
    # TODO: Implement CSV export
    "Name,Email,Phone\n#{contact.full_name},#{contact.email},#{contact.phone}"
  end
end
