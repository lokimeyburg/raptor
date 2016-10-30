var Connection = require('./connection');
var Channel    = require('./channel');
var PresenceChannel = require('./presence-channel');
var _          = require('lodash'); 

function Subscription(socket, socket_id, msg) {
  this.connection    = new Connection(socket, socket_id);
  this.msg = msg;
}

// Delegates
Subscription.prototype.send_payload = function send_payload(channel_id, event_name, payload) {
  this.connection.send_payload(channel_id, event_name, payload);
};

Subscription.prototype.send_message = function send_message(m) {
  this.connection.send_message(m);
};

Subscription.prototype.error = function error(e) {
  this.connection.error(e);
};

Subscription.prototype.socket_id = function socket_id() {
  return this.connection.socket_id;
};

// Public
Subscription.prototype.subscribe = function subscribe() {
  var self = this;
  this.send_payload(this._channel_id(), '/raptor_internal/subscription_succeeded', null);
  this._channel().subscribe(function(m) {
    self.send_message(m);
  });
};

// Private
Subscription.prototype._channel = function _channel() {
  var c;
  var matches = this._channel_id().match(/^\/presence\//);
  if(!_.isNull(matches)){
    c = PresenceChannel.from(this._channel_id());
  } else {
    c = Channel.from(this._channel_id());
  }
  return c;
};

Subscription.prototype._channel_id = function _channel_id() {
  return this.msg.data.channel;
};


Subscription.prototype._hasAuth = function _hasAuth() {
  if(_.isUndefined(this.msg.data.auth)) {
    return false;
  } else {
    return true;
  }
};

Subscription.prototype._isInvalidSignature = function _isInvalidSignature() {
  // TODO: finish this function!
  // token(channel_id, data) != auth.split(':')[1]
  return false;
};

Subscription.prototype._handleInvalidSignature = function _handleInvalidSignature() {
  // TODO: interpolate the string below using this method 
  // http://stackoverflow.com/questions/1408289/best-way-to-do-variable-interpolation-in-javascript
  var invalidMessage = "Invalid signature: Expected HMAC SHA256 hex digest of ";
  invalidMessage = invalidMessage + "#{socket_id}:#{channel_id}, but got #{auth}";

  this.error({"message": invalidMessage });
};

// Export
module.exports = Subscription;
