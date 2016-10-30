var WebSocket = require('faye-websocket'),
    http      = require('http');

this.server = http.createServer();

this.server.on('upgrade', function(request, socket, body) {
  if (WebSocket.isWebSocket(request)) {

    var ws = new WebSocket(request, socket, body);
    var Handler = require("./handler");
    var connection_handler;

    ws.on('open', function(event){
      connection_handler = new Handler(ws, event);
    });

    ws.on('message', function(event) {
      connection_handler.on_message(event.data);
    });

    ws.on('close', function(event) {
      // ...
    });
  }
});

exports.run = function () {
  this.server.listen(8080, 'localhost', function(){
    // ...
  });
};

exports.stop = function () {
  this.server.close();
};
