require 'thin'
require 'rack'

module Raptor
  module Service
    def run
      Raptor::Config[:require].each { |f| require f }
      Thin::Logging.silent = true
      Rack::Handler::Thin.run Raptor::ApiServer, Host: Raptor::Config.api_host, Port: Raptor::Config.api_port
      Raptor::WebSocketServer.run
    end

    def stop
      EM.stop if EM.reactor_running?
    end

    extend self
    Signal.trap('HUP') { Raptor::Service.stop }
  end
end
