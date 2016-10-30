var Subscription = require('./subscription'),
    util = require('util');

function PrivateSubscription() {
    Subscription.apply(this, arguments);
}

// Inheritance
util.inherits(PrivateSubscription, Subscription);

// Public
PrivateSubscription.prototype.subscribe = function () { 
  if(this._hasAuth() && this._isInvalidSignature()) {
    return this._handleInvalidSignature();
  }

  var new_subscription = new Subscription(this.connection.socket, this.connection.socket_id, this.msg);
  return new_subscription.subscribe(); 
};

// Export
module.exports = PrivateSubscription;
