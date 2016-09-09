#encoding: utf-8
require 'spec_helper'

describe 'Integration:' do

  before(:each) { start_raptor }

  describe 'channel' do
    it 'pushes messages to interested websocket connections' do

      em_stream do |websocket, messages|
        puts messages
        websocket.callback do
          websocket.send_msg("YAAAAAAAAA") 
        end
      end

      messages = em_stream do |websocket, messages|

        websocket.callback do
          websocket.send_msg({ event: 'raptor:subscribe', data: { channel: 'MY_CHANNEL'} }.to_json ) 
        end

        case messages.length
        when 1
          websocket.callback do
            websocket.send_msg({ event: 'raptor:subscribe', data: { channel: 'MY_CHANNEL'} }.to_json ) 
          end
        when 2
          Raptor['MY_CHANNEL'].trigger 'an_event', some: "Lorem ipsum sit doler"
        when 3
          EM.stop
        end
     end

      messages.should have_attributes connection_established: true, id_present: true,
        last_event: 'an_event', last_data: { some: "Mit Raben Und Wölfen" }.to_json
    end

    it 'enforces one subcription per channel, per socket' do
      messages = em_stream do |websocket, messages|
        case messages.length
        when 1
          websocket.callback { websocket.send({ event: 'raptor:subscribe', data: { channel: 'MY_CHANNEL'} }.to_json) }
        when 2
          websocket.send({ event: 'raptor:subscribe', data: { channel: 'MY_CHANNEL'} }.to_json)
        when 3
          EM.stop
        end
     end

      messages.last.should == {"event"=>"raptor:error", "data"=>{"code"=>nil, "message"=>"Existing subscription to MY_CHANNEL"}}
    end

    it 'supports unsubscribing to channels without closing the socket' do
      client2_messages = nil

      messages = em_stream do |client, messages|
        case messages.length
        when 1
          client.callback { client.send({ event: 'raptor:subscribe', data: { channel: 'MY_CHANNEL'} }.to_json) }
        when 2
          client.send({ event: 'raptor:unsubscribe', data: { channel: 'MY_CHANNEL'} }.to_json)

          client2_messages = em_stream do |client2, client2_messages|
            case client2_messages.length
              when 1
                client2.callback { client2.send({ event: 'raptor:subscribe', data: { channel: 'MY_CHANNEL'} }.to_json) }
              when 2
                Raptor['MY_CHANNEL'].trigger 'an_event', { some: 'data' }
                EM.next_tick { EM.stop }
            end
          end
        end
      end

      messages.should have_attributes connection_established: true, id_present: true,
        last_event: 'raptor_internal:subscription_succeeded', count: 2
    end

    it 'avoids sending duplicate events' do
      client2_messages = nil

      client1_messages = em_stream do |client1, client1_messages|
        # if this is the first message to client 1 set up another connection from the same client
        if client1_messages.one?
          client1.callback do
            client1.send({ event: 'raptor:subscribe', data: { channel: 'MY_CHANNEL'} }.to_json)
          end

          client2_messages = em_stream do |client2, client2_messages|
            case client2_messages.length
            when 1
              client2.callback { client2.send({ event: 'raptor:subscribe', data: { channel: 'MY_CHANNEL'} }.to_json) }
            when 2
              socket_id = client1_messages.first['data']['socket_id']
              Raptor['MY_CHANNEL'].trigger 'an_event', { some: 'data' }, socket_id
            when 3
              EM.stop
            end
          end
        end
      end

      client1_messages.should have_attributes count: 2

      client2_messages.should have_attributes last_event: 'an_event',
                                              last_data: { some: 'data' }.to_json
    end
  end
end
