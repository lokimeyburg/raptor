require 'eventmachine'
require 'em-websocket'

module Raptor
  module WebSocketServer
    def run
      EM.epoll
      EM.kqueue

      EM.run do
        options = {
          host:    Raptor::Config[:websocket_host],
          port:    Raptor::Config[:websocket_port],
          debug:   Raptor::Config[:debug],
          app_key: Raptor::Config[:app_key]
        }

        if Raptor::Config[:tls_options]
          options.merge! secure: true,
                         tls_options: Raptor::Config[:tls_options]
        end

        EM::WebSocket.start options do |ws|
          # Keep track of handler instance in instance of EM::Connection to ensure a unique handler instance is used per connection.
          ws.class_eval { attr_accessor :connection_handler }
          # Delegate connection management to handler instance.
          ws.onopen     { |handshake| ws.connection_handler = Raptor::Config.socket_handler.new(ws, handshake) }
          ws.onmessage  { |msg| ws.connection_handler.onmessage msg }
          ws.onclose    { ws.connection_handler.onclose }
        end
      end
    end
    extend self
  end
end