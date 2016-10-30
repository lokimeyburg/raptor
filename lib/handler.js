var urlParser = require('url');
var Connection = require('./connection');
var _ = require('lodash');

function Handler(socket, handshake) {
  this.socket        = socket;
  this.handshake     = handshake;
  this.connection    = new Connection(this.socket, null);
  this.subscriptions = {};
  this.authenticate();
}

// Delegates
Handler.prototype.error = function error(e) {
  this.connection.error(e);
};

Handler.prototype.send_payload = function send_payload(channel_id, event_name, payload) {
  this.connection.send_payload(channel_id, event_name, payload);
};

// Public
Handler.prototype.authenticate = function authenticate() {
  if(this._is_valid_app_key()) {
    this.connection.establish();
  } else {
    this.error({ code: 4001, message: "Could not find app by key " + this._app_key() });
    this.socket.close();
  }
};

Handler.prototype.on_message = function on_message(msg){
  msg = JSON.parse(msg);
  event = msg.event.replace(/^\/raptor\//, "raptor_");
  if(event == "client"){ // TODO: replace trailing/leading slashes
    msg.socket_id = this.connection.socket_id;
    this.channel.send_client_message(msg);
  } else if(event in this) {
    this[event](msg);
  }
};

Handler.prototype.raptor_subscribe = function raptor_subscribe(msg) {
  var channel_id = msg.data.channel;
  var klass = this._subscription_klass(channel_id);

  if(_.contains(this.subscriptions, channel_id)) {
    this.error({ code: nil, message: "Existing subscription to " + channel_id });
  } else {
    var new_subscription = new klass(this.connection.socket, this.connection.socket_id, msg);
    this.subscriptions[channel_id] = new_subscription.subscribe();
  }
};

// Private
Handler.prototype._is_valid_app_key = function _is_valid_app_key(){
  if(this._app_key() == '765ec374ae0a69f4ce44')
    return true;
  else
    return false;
};

Handler.prototype._app_key = function _app_key(){
  var app_key = this._path().split("/")[1];
  return app_key;
}

Handler.prototype._path = function _path(){
  var urlParts = urlParser.parse(this.handshake.target.url);
  return urlParts.pathname;
};

Handler.prototype._subscription_klass = function _subscription_klass(channel_id){
  var klass;

  var match = channel_id.match(/^\/(private|presence)\//);

  if(match !== null && (match[1] !== null)) {
    klass = require('./' + match[1] + '-subscription');
  }

  if(klass === undefined || klass === null){
    klass = require('./subscription');
  }

  return klass;
};

// Export
module.exports = Handler;
