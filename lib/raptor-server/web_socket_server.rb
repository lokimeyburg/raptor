require 'eventmachine'
require 'em-websocket'

module RaptorServer
  module WebSocketServer
    def run
      EM.epoll
      EM.kqueue

      EM.run do
        options = {
          host:    RaptorServer::Config[:websocket_host],
          port:    RaptorServer::Config[:websocket_port],
          debug:   RaptorServer::Config[:debug],
          app_key: RaptorServer::Config[:app_key]
        }

        if RaptorServer::Config[:tls_options]
          options.merge! secure: true,
                         tls_options: RaptorServer::Config[:tls_options]
        end

        EM::WebSocket.start options do |ws|
          # Keep track of handler instance in instance of EM::Connection to ensure a unique handler instance is used per connection.
          ws.class_eval { attr_accessor :connection_handler }
          # Delegate connection management to handler instance.
          ws.onopen     { |handshake| ws.connection_handler = RaptorServer::Config.socket_handler.new(ws, handshake) }
          ws.onmessage  { |msg| ws.connection_handler.onmessage msg }
          ws.onclose    { ws.connection_handler.onclose }
        end
      end
    end
    extend self
  end
end