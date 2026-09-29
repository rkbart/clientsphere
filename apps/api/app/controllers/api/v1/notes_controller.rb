class Api::V1::NotesController < Api::V1::BaseController
  before_action :set_note, only: [:show, :update, :destroy]

  def index
    notes = policy_scope(Note)
    notes = notes.where(notable_type: params[:notable_type]) if params[:notable_type].present?
    notes = notes.where(notable_id: params[:notable_id]) if params[:notable_id].present?
    notes = notes.order(:created_at).reverse_order

    paginate(notes)
  end

  def show
    authorize @note
    render json: @note
  end

  def create
    note = Note.new(note_params)
    note.account = Current.account
    note.author = Current.user
    authorize note
    note.save!
    render json: note, status: :created
  end

  def update
    authorize @note
    @note.update!(note_params)
    render json: @note
  end

  def destroy
    authorize @note
    @note.destroy!
    head :no_content
  end

  private

  def set_note
    @note = Note.find(params[:id])
  end

  def note_params
    params.require(:note).permit(:body, :notable_type, :notable_id)
  end
end
