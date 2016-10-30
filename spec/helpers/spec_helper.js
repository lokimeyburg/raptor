var server = require('../../lib/websocket-server');

exports.runWebSocketServer = function(){
  server.run();
}


exports.stopWebSocketServer = function(){
  server.stop();
}