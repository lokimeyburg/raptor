// RedisHandler class.
// Interface with RedisHandler.

var redis = require("redis"),
    Channel    = require('./channel'),
    _ = require('lodash');

function RedisHandler(){

}

// Delegates
RedisHandler.publish = function(channel, message) {
  RedisHandler.publisher().publish(channel, message);
};

RedisHandler.subscribe = function(channel) {
  RedisHandler.subscriber().subscribe(channel, function(err, obj){
    // ... do something ...
  });
};

RedisHandler.hgetall = function(val, callback) {
  RedisHandler.regular_connection().hgetall(val, function(err, obj){
    callback(err, obj);
  });
};

RedisHandler.hset = function(channel_id, key, value) {
  RedisHandler.regular_connection().hset(channel_id, key, value);
};

RedisHandler.hdel = function(channel_id, key) {
  RedisHandler.regular_connection().hdel(channel_id, key);
};

RedisHandler.hincrby = function(key, channel_id, amount) {
  RedisHandler.regular_connection().hincrby(key, channel_id, amount);
};

// Private
RedisHandler.regular_connection = function(){
  if(_.isUndefined(this._regular_connection)){
    this._regular_connection = RedisHandler.new_connection();
  }
  return this._regular_connection;
};

RedisHandler.publisher = function(){
  if(_.isUndefined(this._publisher)){
    this._publisher = RedisHandler.new_connection();
  }
  return this._publisher;
};

RedisHandler.new_connection = function(){
  var client = redis.createClient("6379", "127.0.0.1");
  return client;
};

RedisHandler.subscriber = function(){
  if(_.isUndefined(this._subscriber)){
    var connection = RedisHandler.new_connection();
    connection.on("message", function(channel, message){
      if(_isJsonString(message)){
        message = JSON.parse(message);
      }
      console.log(channel);
      var Channel  = require('./channel');
      var c;
      var matches = channel.match(/^\/presence\//);
      if(!_.isNull(matches)){
        var PresenceChannel  = require('./presence-channel');
        c = PresenceChannel.from(message.channel);
      } else {
        var Channel  = require('./channel');
        c = Channel.from(message.channel);
      }

      c.dispatch(message, channel);
    });
    this._subscriber = connection;
  }

  return this._subscriber;
};

function _isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


// Export
module.exports = RedisHandler;

