var helper    = require('./helpers/spec_helper'),
    WebSocket = require('faye-websocket'),
    redisTest = require('redis');

describe('WebsocketServer', function() {

  beforeEach(function(){
    helper.runWebSocketServer();
  });

  afterEach(function(){
    helper.stopWebSocketServer();
  });

  describe('connecting', function() {

    it('should start a handler', function(done) {

      var ws = new WebSocket.Client('ws://localhost:8080/raptor/1');

      ws.on('open', function(event) {
        ws.send('{"event": "/raptor/subscribe",  "data": { "channel":"/presence/myChannel", "auth":"notarealauth", "channel_data": { "user_id": "25" } } }');
      });

      ws.on('message', function(event) {
        console.log('message: ', event.data);
        var data = JSON.parse(event.data);
        if(data.event == '/raptor_internal/subscription_succeeded'){
          var redisClient = redisTest.createClient("6379", "127.0.0.1");
          redisClient.publish("raptor:connection_notification", JSON.stringify({ "channel": "/presence/myChannel", "foo": "goal", "auth":"notarealauth", "online": true, "channel_data":{ "user_id": "13" } }));
        }
        if(false)
          done();
      });

    });


  });

});
