require 'fiber'
require 'em-http-request'

module RaptorServer
  module Webhook
    def post payload
      return unless RaptorServer::Config.webhook_url

      payload = {
        time_ms: Time.now.strftime('%s%L'), events: [payload]
      }.to_json

      digest   = OpenSSL::Digest::SHA256.new
      hmac     = OpenSSL::HMAC.hexdigest(digest, RaptorServer::Config.secret, payload)

      EM::HttpRequest.new(RaptorServer::Config.webhook_url).post(body: payload, head: { "X-Raptor-Key" => RaptorServer::Config.app_key, "X-Raptor-Secret" => hmac })
        # TODO: Exponentially backed off retries for errors
    end

    extend self
  end
end
