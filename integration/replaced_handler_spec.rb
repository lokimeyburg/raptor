require 'spec_helper'
require 'lib/raptor/handler.rb'

class ReplacedHandler < Raptor::Handler
  def authenticate
    super
    send_payload nil, 'raptor:info', { message: "Welcome!" }
  end
end

describe 'Replacable handler' do
  it 'says welcome' do
    start_raptor_with_options socket_handler: ReplacedHandler

    msgs = em_stream do |websocket, messages|
      if messages.length == 2
        EM.stop
      end
    end

    msgs.last.should == { "event" => "raptor:info", "data" => { "message" => "Welcome!" } }
  end
end
