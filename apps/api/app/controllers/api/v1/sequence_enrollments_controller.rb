class Api::V1::SequenceEnrollmentsController < Api::V1::BaseController
  def index
    sequence = Current.account.email_sequences.find(params[:email_sequence_id])
    authorize sequence, :show?
    enrollments = policy_scope(SequenceEnrollment).where(sequence: sequence).order(:created_at).reverse_order
    paginate(enrollments)
  end

  def unsubscribe
    enrollment = Current.account.sequence_enrollments.find(params[:id])
    authorize enrollment
    enrollment.update!(status: :unsubscribed)
    render json: enrollment
  end

  def destroy
    enrollment = Current.account.sequence_enrollments.find(params[:id])
    authorize enrollment
    enrollment.destroy!
    head :no_content
  end
end
