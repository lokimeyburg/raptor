module RaptorHelperMethods
  def start_raptor_with_options options={}
    # Fork service. Our integration tests MUST block the main thread because we want to wait for i/o to finish.
    @server_pid = EM.fork_reactor do
      require File.expand_path(File.dirname(__FILE__) + '/../raptor-server.rb')
      # Thin::Logging.silent = false

      opts = { api_host:         '0.0.0.0',
               websocket_host:   '0.0.0.0',
               api_port:         '4567',
               websocket_port:   '8080',
               app_key:          '765ec374ae0a69f4ce44',
               secret:           '19b74451a08ea35ceed7',
               debug:            false  }

      RaptorServer::Config.load opts.merge(options)
      RaptorServer::Service.run
    end
    wait_for_raptor
  end

  alias start_raptor start_raptor_with_options

  def stop_raptor
    # Ensure Raptor is properly stopped. No orphaned processes allowed!
     Process.kill 'SIGKILL', @server_pid
     Process.wait @server_pid
  end

  def wait_for_raptor opts = {}
    opts = { port: 8080 }.update opts
    begin
      TCPSocket.new('0.0.0.0', opts[:port]).close
    rescue
      sleep 0.005
      retry
    end
  end

  def new_websocket opts = {}
    opts = { key: Raptor.key }.update opts
    uri = "ws://0.0.0.0:8080/#{opts[:key]}?client=js&version=2.1.4"


    EventMachine::WebSocketClient.connect(uri).tap { |ws| ws.errback &errback }
  end

  def em_stream opts = {}
    messages = []

    em_thread do
      websocket = new_websocket opts

      websocket.stream do |message|
        # message = JSON.parse(message)


        messages << JSON.parse(message.data)
        yield websocket, messages
      end

      yield websocket, messages
    end

    return messages
  end

  def em_thread
    Thread.new do
      EM.run do
        yield
      end
    end.join
  end

  def auth_from options
    id      = options[:message]['data']['socket_id']
    name    = options[:name]
    user_id = options[:user_id]
    Raptor['/presence/channel'].authenticate(id, {user_id: user_id, user_info: {name: name}})
  end

  def send_subscribe options
    auth = auth_from options
    options[:user].send({event: '/raptor/subscribe',
                  data: {channel: '/presence/channel'}.merge(auth)}.to_json)
  end

  def private_channel websocket, message
    auth = Raptor['/private/channel'].authenticate(message['data']['socket_id'])[:auth]
    websocket.send({ event: '/raptor/subscribe',
                     data: { channel: '/private/channel',
               auth: auth } }.to_json)

  end
end