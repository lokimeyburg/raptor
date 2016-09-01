# encoding: utf-8
require 'sinatra/base'
require 'signature'
require 'json'
require 'active_support/core_ext/hash'
require 'eventmachine'
require 'em-hiredis'
require 'rack'
require 'fiber'
require 'rack/fiber_pool'

module RaptorServer
  class ApiServer < Sinatra::Base
    use Rack::FiberPool
    set :raise_errors, lambda { false }
    set :show_exceptions, false

    # Respond with HTTP 401 Unauthorized if request cannot be authenticated.
    error(Signature::AuthenticationError) { |c| halt 401, "401 UNAUTHORIZED\n" }

    post '/events' do
      authenticate

      # Event and channel data are now serialized in the JSON data
      # So, extract and use it
      data = JSON.parse(request.body.read.tap{ |s| s.force_encoding('utf-8')})

      # Send event to each channel
      data["channels"].each { |channel| publish(channel, data['name'], data['data'], data['socket_id']) }

      return {}.to_json
    end

    def payload(channel, event, data, socket_id)
      {
        event:     event,
        data:      data,
        channel:   channel,
        socket_id: socket_id
      }.select { |_,v| v }.to_json
    end

    def authenticate
      Signature::Request.new('POST', env['PATH_INFO'], params.except('captures', 'splat' , 'channel_id')).authenticate { |key| Signature::Token.new key, RaptorServer::Config.secret }
    end

    def publish(channel, event, data, socket_id = nil)
      f = Fiber.current

      # Publish the event in Redis and translate the result into an HTTP
      # status to return to the client.
      RaptorServer::Redis.publish(channel, payload(channel, event, data, socket_id)).tap do |r|
        r.callback { f.resume [202, {}, "202 ACCEPTED\n"] }
        r.errback  { f.resume [500, {}, "500 INTERNAL SERVER ERROR\n"] }
      end

      Fiber.yield
    end

  end
end

