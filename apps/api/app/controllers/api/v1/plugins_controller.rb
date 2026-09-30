class Api::V1::PluginsController < Api::V1::BaseController
  def index
    plugins = policy_scope(Plugin).order(:name)
    render json: plugins
  end

  def show
    plugin = Current.account.plugins.find(params[:id])
    authorize plugin
    render json: plugin
  end

  def create
    plugin = Current.account.plugins.new(plugin_params)
    authorize plugin
    plugin.save!
    render json: plugin, status: :created
  end

  def update
    plugin = Current.account.plugins.find(params[:id])
    authorize plugin
    plugin.update!(plugin_params)
    render json: plugin
  end

  def destroy
    plugin = Current.account.plugins.find(params[:id])
    authorize plugin
    plugin.destroy!
    head :no_content
  end

  private

  def plugin_params
    params.require(:plugin).permit(:name, :description, :webhook_url, :is_active, triggers: [])
  end
end
