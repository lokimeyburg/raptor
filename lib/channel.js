// Channel class.
//

var _ = require('lodash'),
    RedisHandler = require('./redis-handler');

function Channel() {
  this.internal_subscription_table = [];
}

Channel.channels = [];

Channel.from = function(channel_id){
  return Channel.find_or_create_by_channel_id(channel_id);
};

Channel.find_or_create_by_channel_id = function(channel_id){
  var existingChannel = _.find(Channel.channels, { 'channel_id': channel_id });
  if(_.isUndefined(existingChannel)) {
    return Channel.createChannel(channel_id);
  } else {
    return existingChannel;
  }
};

Channel.createChannel = function(channel_id){
  var channel = new Channel();
  channel.channel_id = channel_id;
  Channel.channels.push(channel);
  RedisHandler.subscribe(channel_id);
  return channel;
};

Channel.prototype.subscribe = function subscribe(func){
  return this._addSubscriberToInternalTable(func);
};

Channel.prototype.dispatch = function dispatch(message, channel){

  if(channel.indexOf('/raptor/') == -1){
    this._push(message);
  }
};

// Private
Channel.prototype._addSubscriberToInternalTable = function _addSubscriberToInternalTable(func){
  var subscriber = {
    "callback": func,
    "sid": _uuid()
  };

  this.internal_subscription_table.push(subscriber);
  return subscriber.sid;
};


Channel.prototype._push = function _push(msg){
  _(this.internal_subscription_table).forEach(function(sub) {
      sub.callback(msg);
    });
};

var _uuid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

// Export
module.exports = Channel;
//     class << self
//       def from channel_id
//         klass = channel_id[/^\/presence\//] ? PresenceChannel : Channel
//         klass.find_or_create_by_channel_id channel_id
//       end


//       def unsubscribe channel_id, subscription_id
//         from(channel_id).try :unsubscribe, subscription_id
//       end

//       def send_client_message msg
//         from(msg['channel']).try :send_client_message, msg
//       end

// require 'glamazon'
// require 'eventmachine'
// require 'forwardable'

// module RaptorServer
//   class Channel
//     include Glamazon::Base
//     extend  Forwardable

//     def_delegators :channel, :push

//     class << self
//       def from channel_id
//         klass = channel_id[/^\/presence\//] ? PresenceChannel : Channel
//         klass.find_or_create_by_channel_id channel_id
//       end


//       def unsubscribe channel_id, subscription_id
//         from(channel_id).try :unsubscribe, subscription_id
//       end

//       def send_client_message msg
//         from(msg['channel']).try :send_client_message, msg
//       end
//     end

//     def initialize(attrs)
//       super
//       RaptorServer::Redis.subscribe channel_id
//     end

//     def channel
//       @channel ||= EM::Channel.new
//     end

//     def subscribe *a, &blk
//       RaptorServer::Redis.hincrby('channel_subscriber_count', channel_id, 1).
//         callback do |value|
//           RaptorServer::Webhook.post name: 'channel_occupied', channel: channel_id if value == 1
//         end

//       channel.subscribe *a, &blk
//     end

//     def unsubscribe *a, &blk
//       RaptorServer::Redis.hincrby('channel_subscriber_count', channel_id, -1).
//         callback do |value|
//           RaptorServer::Webhook.post name: 'channel_vacated', channel: channel_id if value == 0
//         end

//       channel.unsubscribe *a, &blk
//     end


//     # Send a client event to the EventMachine channel.
//     # Only events to channels requiring authentication (private or presence)
//     # are accepted. Public channels only get events from the API.
//     def send_client_message(message)
//       RaptorServer::Redis.publish(message['channel'], message.to_json) if authenticated?
//     end

//     # Send an event received from Redis to the EventMachine channel
//     # which will send it to subscribed clients.
//     def dispatch(message, channel)
//       push(message.to_json) unless channel =~ /^\/raptor\//
//     end

//     def authenticated?
//       channel_id =~ /^\/private\// || channel_id =~ /^\/presence\//
//     end
//   end
// end
