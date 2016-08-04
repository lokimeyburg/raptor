require 'thin'
require 'rack'

module RaptorServer
  module Service
    def run
      RaptorServer::Config[:require].each { |f| require f }
      Thin::Logging.silent = true
      Rack::Handler::Thin.run RaptorServer::ApiServer, Host: RaptorServer::Config.api_host, Port: RaptorServer::Config.api_port
      RaptorServer::WebSocketServer.run
    end

    def stop
      EM.stop if EM.reactor_running?
    end

    extend self
    Signal.trap('HUP') { RaptorServer::Service.stop }
  end
end
