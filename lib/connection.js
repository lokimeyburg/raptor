function Connection(socket, socket_id) {
  this.socket    = socket;
  this.socket_id = socket_id;
}

Connection.prototype.establish = function establish() {
  this.socket_id = _uuid();
  this.send_payload(null, '/raptor/connection_established', { socket_id: this.socket_id } );
};

Connection.prototype.send_message = function send_message(m) {
  var msg;
  if(_isJsonString(m)){
    msg = JSON.parse(m);
  } else {
    msg = m;
  }

  // strip the socket_id
  var socket_id = msg.socket_id;
  delete msg.socket_id;

  // exclude publishing to this socket_id
  if (socket_id != this.socket_id){
    console.log(JSON.stringify(msg));
    this.socket.send(JSON.stringify(msg));
  }
};

Connection.prototype.error = function error(e){
  this.send_payload(null, '/raptor/error', e);
};

Connection.prototype.send_payload = function send_payload(channel_id, event_name, payload){

  var body = { event: event_name, data: payload };
  if(channel_id !== null){
    body.channel = channel_id;
  }
  this.socket.send(JSON.stringify(body));
}

// Private
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


function _isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// Export
module.exports = Connection;







