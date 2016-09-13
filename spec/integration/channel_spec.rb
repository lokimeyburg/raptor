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
            websocket.send_msg({ event: '/raptor/subscribe', data: { channel: 'lobby' } }.to_json)
          when 1
            Raptor['lobby'].trigger 'chat_message', { some: "data" }
          when 2
            EM.stop
          end
        end
      end # messages
      messages.should have_attributes connection_established: true, last_event: 'chat_message', last_data: { some: "data" }.to_json
    end

    it 'enforces one subcription per channel, per socket' do
      messages = em_stream do |websocket, messages|
        case messages.length
        when 0
          websocket.callback { websocket.send_msg({ event: '/raptor/subscribe', data: { channel: 'lobby'} }.to_json) }
        when 1
          websocket.send({ event: '/raptor/subscribe', data: { channel: 'lobby'} }.to_json)
        when 2
          EM.stop
        end
     end

      messages.last.should == {"event"=>"/raptor/error", "data"=>{"code"=>nil, "message"=>"Existing subscription to lobby"}}
    end



  end # describe
end