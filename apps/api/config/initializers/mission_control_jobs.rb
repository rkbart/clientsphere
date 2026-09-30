# Mission Control (Solid Queue dashboard) authentication.
#
# The engine enables HTTP basic auth by default and reads credentials from
# Rails credentials (mission_control.http_basic_auth_user/password).
# ENV takes precedence when set, so deployments can inject secrets without
# editing credentials. With neither set, the dashboard stays closed (401).
if ENV["MISSION_CONTROL_USER"].present? || ENV["MISSION_CONTROL_PASSWORD"].present?
  MissionControl::Jobs.http_basic_auth_user = ENV["MISSION_CONTROL_USER"]
  MissionControl::Jobs.http_basic_auth_password = ENV["MISSION_CONTROL_PASSWORD"]
end
