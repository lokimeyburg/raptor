#encoding: utf-8
require 'spec_helper'

describe 'Integration:' do

  before(:each) { start_raptor }

  describe 'channel' do
    it 'pushes messages to interested websocket connections' do

      messages = em_stream do |websocket, messages|

        case messages.length
        when 0
          websocket.callback { websocket.send_msg({ event: '/raptor/subscribe', data: { channel: 'lobby' } }.to_json) }
        when 1
          Raptor['lobby'].trigger 'chat_message', { some: "data" }
        when 2
          EM.stop
        end
      end # messages
      messages.should have_attributes connection_established: true, last_event: 'chat_message', last_data: { some: "data" }.to_json
    end

    it 'enforces one subcription per channel, per socket' do
      messages = em_stream do |websocket, messages|
        case messages.length
        when 0
          websocket.callback { websocket.send_msg({ event: '/raptor/subscribe', data: { channel: 'lobby' } }.to_json) }
        when 1
          websocket.callback { websocket.send_msg({ event: '/raptor/subscribe', data: { channel: 'lobby' } }.to_json) }
        when 2
          EM.stop
        end
      end
      
      messages.last.should == {"event"=>"/raptor/error", "data"=>{"code"=>nil, "message"=>"Existing subscription to lobby"}}
    end

    it 'supports unsubscribing to channels without closing the socket' do
      client2_messages = nil

      messages = em_stream do |client, messages|
        case messages.length
        when 0
          client.callback { client.send_msg({ event: '/raptor/subscribe', data: { channel: 'lobby'} }.to_json) }
        when 1
          client.callback { client.send_msg({ event: '/raptor/unsubscribe', data: { channel: 'lobby'} }.to_json) }
          sleep 0.01
          client2_messages = em_stream do |client2, client2_messages|
            case client2_messages.length
            when 0
              client2.callback { client2.send_msg({ event: '/raptor/subscribe', data: { channel: 'lobby'} }.to_json) }
            when 1
              Raptor['lobby'].trigger 'chat_message', { some: 'data' }
              EM.next_tick { EM.stop }
            end
          end
        end
      end

      messages.should_not have_attributes connection_established: true, last_event: 'chat_message'
      client2_messages.should have_attributes connection_established: true, last_event: 'chat_message'
    end

    xit 'avoids sending duplicate events' do
      client2_messages = nil

      messages = em_stream do |client, messages|
        case messages.length
        when 0
          client.callback { client.send_msg({ event: '/raptor/subscribe', data: { channel: 'lobby'} }.to_json) }
        when 1
          sleep 0.01
          client2_messages = em_stream do |client2, client2_messages|
            case client2_messages.length
            when 0
              client2.callback { client2.send_msg({ event: '/raptor/subscribe', data: { channel: 'lobby'} }.to_json) }
            when 1
              Raptor['lobby'].trigger 'chat_message', { some: 'data' }
              EM.next_tick { EM.stop }
            end
          end
        end
      end

      puts messages
      puts client2_messages

      # client1_messages.should have_attributes count: 2

      # client2_messages.should have_attributes last_event: 'an_event',
      #                                         last_data: { some: 'data' }.to_json
    end




  end # describe
end