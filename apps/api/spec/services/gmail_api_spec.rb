require "rails_helper"

RSpec.describe GmailApi do
  # NOTE: stub the HTTP gem's chainable client (our seam is GmailApi itself —
  # never let a spec touch googleapis.com).
  def stub_http(response)
    client = double("http-client")
    allow(HTTP).to receive(:timeout).with(10).and_return(client)
    allow(client).to receive(:headers).and_return(client)
    allow(client).to receive(:post).and_return(response)
    client
  end

  def json_response(status_code, payload)
    status = double("status")
    allow(status).to receive(:success?).and_return(status_code.between?(200, 299))
    allow(status).to receive(:==).and_return(false)
    allow(status).to receive(:==).with(status_code).and_return(true) if status_code == 401
    allow(status).to receive(:to_s).and_return(status_code.to_s)
    double("response", status: status, body: payload.to_json)
  end

  describe ".access_token" do
    it "exchanges a refresh token with form params" do
      client = stub_http(json_response(200, { "access_token" => "ya29.fresh", "expires_in" => 3599 }))
      stub_const("ENV", ENV.to_h.merge("GOOGLE_CLIENT_ID" => "cid", "GOOGLE_CLIENT_SECRET" => "csecret"))

      expect(described_class.access_token("refresh-123")).to eq("ya29.fresh")
      expect(client).to have_received(:post) do |url, opts|
        expect(url).to eq("https://oauth2.googleapis.com/token")
        expect(opts[:form]).to include(grant_type: "refresh_token", refresh_token: "refresh-123",
                                       client_id: "cid", client_secret: "csecret")
      end
    end

    it "raises AuthError when Google rejects the grant" do
      stub_http(json_response(401, { "error" => "invalid_grant" }))

      expect do
        described_class.access_token("stale-refresh")
      end.to raise_error(described_class::AuthError)
    end
  end

  describe ".send_email" do
    let(:mail) do
      EmailDelivery.build_message(from: "me@gmail.com", to: ["you@example.com"],
                                  subject: "Hi", html: "<p>Hello</p>")
    end

    it "posts base64url RFC822 with a bearer token and returns the id" do
      client = stub_http(json_response(200, { "id" => "gmail-msg-1", "threadId" => "t1" }))

      id = described_class.send_email(access_token: "ya29.fresh", mail: mail)

      expect(id).to eq("gmail-msg-1")
      expect(client).to have_received(:headers).with(hash_including(authorization: "Bearer ya29.fresh"))
      expect(client).to have_received(:post) do |url, opts|
        expect(url).to end_with("/gmail/v1/users/me/messages/send")
        decoded = Base64.urlsafe_decode64(opts[:json][:raw])
        expect(decoded).to include("To: you@example.com").and include("Subject: Hi")
      end
    end

    it "raises AuthError on 401 so callers can ask for a reconnect" do
      stub_http(json_response(401, { "error" => { "message" => "Invalid Credentials" } }))

      expect do
        described_class.send_email(access_token: "ya29.dead", mail: mail)
      end.to raise_error(described_class::AuthError, /Invalid Credentials/)
    end

    it "raises with Google's message on other failures" do
      stub_http(json_response(403, { "error" => { "message" => "Daily Limit Exceeded" } }))

      expect do
        described_class.send_email(access_token: "ya29.fresh", mail: mail)
      end.to raise_error(StandardError, /Daily Limit Exceeded/)
    end
  end
end
