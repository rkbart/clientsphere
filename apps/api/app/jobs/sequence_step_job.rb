class SequenceStepJob < ApplicationJob
  queue_as :default

  def perform(enrollment_id)
    enrollment = SequenceEnrollment.find(enrollment_id)
    return if enrollment.completed? || enrollment.unsubscribed?

    step = enrollment.sequence.steps.find_by(step_order: enrollment.current_step)
    return unless step

    # Send email
    EmailService.send_sequence_step(enrollment.contact, step)

    # Update enrollment
    next_step = enrollment.sequence.steps.find_by(step_order: enrollment.current_step + 1)
    if next_step
      enrollment.update!(
        current_step: next_step.step_order,
        next_send_at: Time.current + next_step.delay_days.days
      )
      SequenceStepJob.set(wait_until: enrollment.next_send_at).perform_later(enrollment.id)
    else
      enrollment.update!(status: :completed)
    end
  end
end
