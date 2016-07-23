module Raptor
  class Connection
    attr_accessor :socket, :socket_id

    def initialize socket, socket_id=nil
      @socket, @socket_id = socket, socket_id
    end

    def send_message m
      msg = JSON.parse(m)

      # strip the socket_id
      s = msg.delete("socket_id")

      # exclude publishing to this socket_id
      socket.send msg.to_json unless s == socket_id
    end

    def send_payload *args
      socket.send format(*args)
    end

    def error e
      send_payload nil, 'raptor:error', e
    end

    def establish
      @socket_id = SecureRandom.uuid
      send_payload nil, 'raptor:connection_established', { socket_id: @socket_id }
    end

    private

    def format(channel_id, event_name, payload = {})
      body = { event: event_name, data: payload }
      body[:channel] = channel_id if channel_id
      body.to_json
    end
  end
end
