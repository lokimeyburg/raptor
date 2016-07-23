# Raptor

##What is it?

Raptor is a simple realtime messaging and presence server written in Ruby. 
The server is implemented with EventMachine and Redis.
The architecture is inspired by other realtime messaging services such as Faye, Raptor and XMPP.

##Install 

```
$ gem install raptor
```

##Local development

```
git clone 'https://github.com/lokimeyburg/raptor-machine.git'
bundle install
redis-server &> /dev/null &
raptor --app_key 765ec374ae0a69f4ce44 --secret 19b74451a08ea35ceed7
```

##Running the example

Edit:
```
Raptor.app_id = '765ec374ae0a69f4ce44'
Raptor.secret = '19b74451a08ea35ceed7'
Raptor.key    = '765ec374ae0a69f4ce44'
```

# How to use it

## Requirements

- Ruby 2.1.0 or greater
- Redis

## Starting the service

Raptor is packaged as a Rubygem. Installing the gem makes the 'raptor' executable available. The `raptor` executable takes arguments, of which two are mandatory: `--app_key` and `--secret`. These can but do not have to be the same as the credentials you use for Raptor. They are required because Raptor performs the same HMAC signing of API requests that Raptor does.

__IMPORTANT:__ Redis must be running where Raptor expects it to be (either on localhost:6379 or somewhere else you told Raptor it would be using the option flag) or Raptor will fail silently. I haven't yet figured out how to get em-hiredis to treat an unreachable host as an error

<pre>
$ gem install raptor

$ redis-server &> /dev/null &

$ raptor --app_key 765ec374ae0a69f4ce44 --secret your-raptor-secret
</pre>

If all went to plan you should see the following output to STDOUT

<pre>
Raptor API server listening on port 4567
Raptor WebSocket server listening on port 8080
</pre>

## Modifying your application code to use the Raptor service

Once you have a Raptor instance listening for incoming connections you need to alter you application code to use the Raptor endpoint instead of Raptor. Fortunately this is very simple, unobtrusive, easily reversable, and very painless.


First you will need to add code to your server side component that publishes events to the Raptor HTTP REST API, usually this means telling the Raptor client to use a different host and port, e.g. consider this Ruby example

<pre>
...

Raptor.host   = 'raptor.example.com'
Raptor.port   = 4567

</pre>

You will also need to do the same to the Raptor JavaScript client in your client side JavaScript, e.g

<pre>
<script type="text/javascript">
  ...

  Raptor.host    = 'raptor.example.com'
  Raptor.ws_port = 8080
  Raptor.wss_port = 8080

</script>
</pre>

Of course you could proxy all requests to `ws.example.com` to port 8080 of your Raptor node and `api.example.com` to port 4567 of your Raptor node for example, that way you would only need to set the host property of the Raptor client.

# Configuration Options

Raptor supports several configuration options, which can be supplied as command line arguments at invocation.

<pre>
-k or --app_key This is the Raptor app key you want to use. This is a required argument

-s or --secret This is your Raptor secret. This is a required argument

-r or --redis_address An address where there is a Redis server running. This is an optional argument and defaults to redis://127.0.0.1:6379/0

-a or --api_host This is the address that Raptor will bind the HTTP REST API part of the service to. This is an optional argument and defaults to 0.0.0.0:4567

-w or --websocket_host This is the address that Raptor will bind the WebSocket part of the service to. This is an optional argument and defaults to 0.0.0.0:8080

-i or --require Require an additional file before starting Raptor to tune it to your needs. This is an optional argument

-p or --private_key_file Private key file for SSL support. This argument is optional, if given, SSL will be enabled

-b or --webhook_url URL for webhooks. This argument is optional, if given webhook callbacks will be made http://raptor.com/docs/webhooks

-c or --cert_file Certificate file for SSL support. This argument is optional, if given, SSL will be enabled

-v or --verbose Useful for debugging
</pre>


# Why use Raptor instead of Raptor?

There a few reasons you might want to use Raptor instead of Raptor, e.g.

- You operate in a heavily regulated industry and are worried about sending data to 3rd parties, and it is an organisational requirement that you own your own infrastructure.
- You might be travelling on an airplane without internet connectivity as I am right now. Airplane rides are very good times to get a lot done, unfortunately external services are also usually unreachable. Remove internet connectivity as a dependency of your development envirionment by running a local Raptor instance in development and Raptor in production.
- Remove the network dependency from your test suite.
- You want to extend the Raptor protocol or have some special requirement. If this applies to you, chances are you are out of luck as Raptor is unlikely to implement something to suit your special use case, and rightly so. With Raptor you are free to modify and extend its behavior anyway that suits your purpose.

&copy; 2013 Loki Meyburg


# Credit & Inspiration

Inspired and borrowed from:

- https://gist.github.com/gvarela/957367
- https://github.com/amscotti/em_sinatra_chat
- https://github.com/palavatv/palava-machine
- https://github.com/stevegraham/slanger
- http://www.youtube.com/watch?v=4iFBC-xbE9I
- http://raptor.com/

