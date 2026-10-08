class Api::V1::ContactsController < Api::V1::BaseController
  before_action :set_contact, only: [:show, :update, :destroy, :export, :erase, :score]
  before_action :validate_contact_status, only: [:create, :update]

  def index
    contacts = policy_scope(Contact).kept
    contacts = contacts.search(params[:q]) if params[:q].present?
    if params[:status].present?
      unless Contact.statuses.key?(params[:status])
        return render json: { error: "status must be one of: #{Contact.statuses.keys.join(', ')}" },
                      status: :unprocessable_entity
      end

      contacts = contacts.where(status: params[:status])
    end
    contacts = contacts.joins(:taggings).where(taggings: { tag_id: params[:tag_id] }) if params[:tag_id].present?
    contacts = CustomFields::Filter.apply(contacts, Current.account, "Contact", params[:custom])

    sort_direction = params[:direction] == "desc" ? :desc : :asc
    contacts = case params[:sort].to_s
               when "email"
                 contacts.order(email: sort_direction, id: sort_direction)
               when "company"
                 contacts.left_joins(:company)
                         .order("companies.name #{sort_direction.to_s.upcase} NULLS LAST, contacts.id #{sort_direction.to_s.upcase}")
               else
                 contacts.order(first_name: sort_direction, last_name: sort_direction, id: sort_direction)
               end

    paginate(contacts, include_associations: [:company, :tags])
  end

  def show
    authorize @contact
    render json: @contact.as_json(include: { company: { only: [:id, :name] }, tags: { only: [:id, :name, :color] } })
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
    @contact = policy_scope(Contact).kept.find(params[:id])
  end

  def validate_contact_status
    status = params.dig(:contact, :status)
    return if status.blank? || Contact.statuses.key?(status)

    render json: { error: "status must be one of: #{Contact.statuses.keys.join(', ')}" },
           status: :unprocessable_entity
  end

  def contact_params
    params.require(:contact).permit(:first_name, :last_name, :email, :phone, :company_id, :owner_id, :status, :source, :job_title, :city, custom_data: {}, social_links: [:platform, :url], billing_address: [:street, :city, :state, :postal_code, :country], shipping_address: [:street, :city, :state, :postal_code, :country])
  end

  def generate_csv(contact)
    require "csv"
    CSV.generate do |csv|
      csv << %w[first_name last_name email phone status source company lead_score]
      csv << [
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone,
        contact.status,
        contact.source,
        contact.company&.name,
        contact.lead_score,
      ]
    end
  end
end
