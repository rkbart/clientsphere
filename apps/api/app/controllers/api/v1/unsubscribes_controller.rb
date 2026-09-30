class Api::V1::UnsubscribesController < Api::V1::BaseController
  skip_before_action :set_current_account_and_user
  skip_after_action :verify_authorized

  # Public: recipients are not logged in. The token is a signed enrollment
  # id, so it cannot be forged or enumerated.
  def create
    enrollment_id = verifier.verify(params[:token])
    enrollment = SequenceEnrollment.find(enrollment_id)
    enrollment.update!(status: :unsubscribed)
    render json: { unsubscribed: true }
  rescue ActiveSupport::MessageVerifier::InvalidSignature, ActiveRecord::RecordNotFound
    render json: { error: "Invalid unsubscribe link." }, status: :not_found
  end

  private

  def verifier
    Rails.application.message_verifier("sequence_unsubscribe")
  end
end
