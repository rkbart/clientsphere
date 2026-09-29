class Api::V1::EmailSequencesController < Api::V1::BaseController
  before_action :set_email_sequence, only: [:show, :update, :destroy, :enroll]

  def index
    email_sequences = policy_scope(EmailSequence)
    email_sequences = email_sequences.order(:created_at)

    paginate(email_sequences)
  end

  def show
    authorize @email_sequence
    render json: @email_sequence
  end

  def create
    email_sequence = EmailSequence.new(email_sequence_params)
    email_sequence.account = Current.account
    authorize email_sequence
    email_sequence.save!
    render json: email_sequence, status: :created
  end

  def update
    authorize @email_sequence
    @email_sequence.update!(email_sequence_params)
    render json: @email_sequence
  end

  def destroy
    authorize @email_sequence
    @email_sequence.destroy!
    head :no_content
  end

  def enroll
    authorize @email_sequence
    contact = Current.account.contacts.find(params[:contact_id])
    first_step = @email_sequence.steps.first
    return render json: { error: "Sequence has no steps yet." }, status: :unprocessable_entity unless first_step

    enrollment = SequenceEnrollment.create!(
      account: Current.account,
      sequence: @email_sequence,
      contact: contact,
      current_step: first_step.step_order,
      status: :active,
      next_send_at: Time.current + first_step.delay_days.days
    )
    SequenceStepJob.set(wait_until: enrollment.next_send_at).perform_later(enrollment.id)
    render json: enrollment, status: :created
  end

  private

  def set_email_sequence
    @email_sequence = EmailSequence.find(params[:id])
  end

  def email_sequence_params
    params.require(:email_sequence).permit(:name, :is_active)
  end
end
