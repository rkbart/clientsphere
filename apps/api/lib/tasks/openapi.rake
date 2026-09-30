# Generates openapi/v1/swagger.yaml from the actual routes so API docs
# never drift from the implementation. Regenerate after route changes:
#
#   bin/rails openapi:generate
namespace :openapi do
  desc "Generate openapi/v1/swagger.yaml from routes"
  task generate: :environment do
    public_actions = Set.new([
      ["api/v1/auth", "signup"],
      ["api/v1/auth", "login"],
      ["api/v1/invitations", "accept"],
      ["api/v1/unsubscribes", "create"],
    ])

    index_query_params = %w[page per_page q]
    summaries = {
      ["api/v1/auth", "signup"] => "Sign up with email, password and workspace name",
      ["api/v1/auth", "login"] => "Log in and receive a session token",
      ["api/v1/auth", "logout"] => "Revoke the current session",
      ["api/v1/auth", "me"] => "Current user, account and memberships",
      ["api/v1/auth", "switch_account"] => "Switch the session's current workspace",
    }

    paths = {}
    Rails.application.routes.routes.each do |route|
      controller = route.defaults[:controller]
      action = route.defaults[:action]
      next unless controller&.start_with?("api/v1/")

      verb = route.verb.to_s.downcase
      next if verb.empty? || verb.include?("|") || verb == "head"

      openapi_path = route.path.spec.to_s.sub("(.:format)", "").gsub(/:(\w+)/, '{\\1}')
      next unless openapi_path.start_with?("/api/")

      resource = controller.remove("api/v1/").singularize
      summary = summaries[[controller, action]] || "#{action.humanize} #{resource.humanize(capitalize: false)}"
      operation_id = "#{action}_#{controller.tr('/', '_')}"

      operation = {
        "summary" => summary,
        "operationId" => operation_id,
        "tags" => [controller.remove("api/v1/")],
        "parameters" => path_params(openapi_path),
        "responses" => responses_for(verb, action),
      }

      if %w[index].include?(action)
        operation["parameters"] += index_query_params.map do |name|
          { "name" => name, "in" => "query", "schema" => { "type" => "string" } }
        end
      end

      if %w[create update].include?(action)
        operation["requestBody"] = {
          "required" => true,
          "content" => {
            "application/json" => {
              "schema" => { "type" => "object", "description" => "#{resource} attributes" },
            },
          },
        }
      end

      unless public_actions.include?([controller, action])
        operation["security"] = [{ "bearerAuth" => [] }]
      end

      paths[openapi_path] ||= {}
      paths[openapi_path][verb] = operation
    end

    doc = {
      "openapi" => "3.0.3",
      "info" => {
        "title" => "ClientSphere API",
        "version" => "v1",
        "description" => "Auth: `Authorization: Bearer <token>` with a session token (from login/signup) " \
                         "or a personal access token (`csk_…`, Settings → API Tokens). " \
                         "Tokens are workspace-scoped. Regenerate with `bin/rails openapi:generate`.",
      },
      "servers" => [{ "url" => "/api" }],
      "paths" => paths.sort.to_h,
      "components" => {
        "securitySchemes" => {
          "bearerAuth" => { "type" => "http", "scheme" => "bearer" },
        },
      },
    }

    out = Rails.root.join("openapi/v1/swagger.yaml")
    FileUtils.mkdir_p(out.dirname)
    File.write(out, doc.to_yaml)
    puts "Wrote #{out} (#{paths.size} paths)"
  end

  def path_params(openapi_path)
    openapi_path.scan(/\{(\w+)\}/).flatten.map do |name|
      { "name" => name, "in" => "path", "required" => true, "schema" => { "type" => "string" } }
    end
  end

  def responses_for(verb, action)
    success = verb == "post" && action == "create" ? "201" : "200"
    {
      success => {
        "description" => "Success",
        "content" => { "application/json" => { "schema" => { "type" => "object" } } },
      },
      "401" => { "description" => "Missing or invalid token" },
    }
  end
end
