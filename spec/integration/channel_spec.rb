#encoding: utf-8
require 'spec_helper'

describe 'Integration:' do

  before(:each) { start_raptor }

  describe 'channel' do
    it 'pushes messages to interested websocket connections' do

      messages = em_stream do |websocket, messages|

        websocket.callback do
          case messages.length
          when 0
            websocket.send_msg({ event: '/raptor/subscribe', data: { channel: 'MY_CHANNEL'} }.to_json)
          when 1
            Raptor['MY_CHANNEL'].trigger 'chat_message', { some: "data" }
          when 2
            EM.stop
          end
        end
      end # messages
      messages.should have_attributes connection_established: true, last_event: 'chat_message', last_data: { some: "data" }.to_json
    end # it



  end # describe
end