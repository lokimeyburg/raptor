var Subscription = require('./subscription'),
    util = require('util'),
    _    = require('lodash');

var self;

// Inheritance
function PresenceSubscription() {
    Subscription.apply(this, arguments);
    self = this;
}
util.inherits(PresenceSubscription, Subscription);

// Public
PresenceSubscription.prototype.subscribe = function () {
  if(this._isInvalidSignature()) {
    return this._handleInvalidSignature();
  }

  if(!this._has_channel_data()){
    return this.connection.error({"message": "this channel is a presence channel and subscription must include channel_data"});
  }

  var new_subscription = this._channel().subscribe(this.msg, self._callback, function(m) {
    self.send_message(m);
  });

  return new_subscription;
};


// Private
PresenceSubscription.prototype._has_channel_data = function(){
   if(_.isUndefined(this.msg.data.channel_data)){
      return false;
   } else {
      return true;
   }
};

PresenceSubscription.prototype._callback = function _callback(){
  self._channel().subscribers(function(subscribers){
    self.connection.send_payload(self._channel_id(), '/raptor_internal/subscription_succeeded', {
      "presence": {
        "count": _.size(subscribers),
        "ids": _.map(subscribers, function(v,k) { return parseInt(k, 10); }),
        "hash": subscribers
      }
    });
  });
};

// Export
module.exports = PresenceSubscription;

