var RedisHandler = require('./redis-handler'),
    Channel = require('./channel'),
    util = require('util'),
    _    = require('lodash');

var self;

// Inheritance
function PresenceChannel() {
  Channel.apply(this, arguments);
  this.internal_subscription_table = [];
  // Also subscribe the raptor daemon to a Redis channel used for events concerning subscriptions.
  RedisHandler.subscribe('raptor:connection_notification');
  self = this;
}

util.inherits(PresenceChannel, Channel);


// Delegators

// Public
PresenceChannel.prototype.dispatch = function dispatch(message, channel){
  var matches = channel.match(/^raptor:/);
  console.log("dispatching: ");
  if(matches !== null && matches.length > 0){
    // Messages received from the Redis channel raptor:*  carry info on
    // subscriptions. Update our subscribers accordingly.
    this._update_subscribers(message);
  } else {
    this._push(message);
  }
};

PresenceChannel.prototype.subscribe = function subscribe(msg, callback, func){
  var channel_data = msg.data.channel_data,
      self = this,
      sid = this._addSubscriberToInternalTable(func);

  // Send event about the new subscription to the Redis raptor:connection_notification Channel.
  var publisher = this._publish_connection_notification({ subscription_id: sid, online: true, channel_data: channel_data, channel: this.channel_id});

  // Associate the subscription data to the public id in Redis.
  this._roster_add(sid, JSON.stringify(channel_data));


  // The Subscription event has been sent to Redis successfully.
  // Call the provided callback.
  // TODO: throw this in a callback in case we can't send anything to Redis
  callback();
  // TODO: remove from internal subscription table of failure to subscribe

  return sid;
};


PresenceChannel.from = function(channel_id){
  return PresenceChannel.find_or_create_by_channel_id(channel_id);
};

PresenceChannel.createChannel = function(channel_id){
  var channel = new PresenceChannel();
  channel.channel_id = channel_id;
  Channel.channels.push(channel);

  RedisHandler.subscribe(channel_id);
  return channel;
};

PresenceChannel.find_or_create_by_channel_id = function(channel_id){
  var existingChannel = _.find(Channel.channels, { 'channel_id': channel_id });
  if(_.isUndefined(existingChannel)) {
    return PresenceChannel.createChannel(channel_id);
  } else {
    return existingChannel;
  }
};

PresenceChannel.createChannel = function(channel_id){
  var channel = new PresenceChannel();
  channel.channel_id = channel_id;
  Channel.channels.push(channel);
  RedisHandler.subscribe(channel_id);
  return channel;
};

// TODO: may never be called. Possibly just remove
PresenceChannel.prototype.ids = function ids(func){
  this._subscriptions(function(resp){
    func(_.map(resp, function(v) { return v.user_id; }));
  });
};

PresenceChannel.prototype.subscribers = function subscribers(func){
  var subscriberList = {};
  this._subscriptions(function(resp){
    _.each(resp, function(v) {
      var parsedHash = JSON.parse(v);
      // set value to null if nothing's defined so that it appears
      // in the JSON response
      var parsedUserInfo = null;
      if(!_.isUndefined(parsedHash.user_info)){
        parsedUserInfo = parsedHash.user_info;
      }

      subscriberList[parsedHash.user_id] = parsedUserInfo;
    });
    func(subscriberList);
  });
};

// def unsubscribe(public_subscription_id)
//   # Unsubcribe from EM::Channel
//   channel.unsubscribe(internal_subscription_table.delete(public_subscription_id)) # if internal_subscription_table[public_subscription_id]
//   # Remove subscription data from Redis
//   roster_remove public_subscription_id
//   # Notify all instances
//   publish_connection_notification subscription_id: public_subscription_id, online: false, channel: channel_id
// end

// Private

PresenceChannel.prototype._subscriptions = function _subscriptions(func){
  // subscriptions ||= get_roster || {}
  var redisResponse;

  RedisHandler.hgetall(this.channel_id, function(err, obj){
    return func(obj);
  });
};

PresenceChannel.prototype._roster_add = function _roster_add(key, value){
  RedisHandler.hset(this.channel_id, key, value);
};

PresenceChannel.prototype._roster_remove = function _roster_remove(key){
  RedisHandler.hdel(this.channel_id, key);
};

PresenceChannel.prototype._publish_connection_notification = function _publish_connection_notification(payload, retry_count){
  if(retry_count === null)
    retry_count = 0;
  // TODO: handle errors and then retry
  var publishable = RedisHandler.publish('raptor:connection_notification', payload);
};


PresenceChannel.prototype._update_subscribers = function _update_subscribers(message){
  // TODO: check if "online" is false - only then remove member
  if(!_.isUndefined(message.online)){
    // TODO: check for multiple browser instances
    this._subscriptions(function(resp){
      if(!(message.channel_data in resp)){
        self._push(self._payload('/raptor_internal/member_added', message.channel_data));
      } else {
        var subscriber = resp[message.subscription_id];
        delete resp[message.subscription_id];
        self._push(self._payload('/raptor_internal/member_removed', { user_id: subscriber.user_id }));
      }
    }

  )};
};

PresenceChannel.prototype._payload = function _payload(event_name, payload){
  return { "channel": this.channel_id, "event": event_name, "data": payload };
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
module.exports = PresenceChannel;
