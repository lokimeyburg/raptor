# Transponder


Don't do this
==============
```
gem 'raptor'
```

Do this:
--------

```
gem install raptor
redis-server &> /dev/null &

raptor --app_key 765ec374ae0a69f4ce44 --secret 19b74451a08ea35ceed7
```

Raptor is intended as a server that is easy to install, not a gem inside Rails or Sinatra.

##Typical usage

Raptor is a standalone server ruby implementation of the Pusher protocol.  It
is not designed to run inside a Rails or sinatra app, but it can be easily
installed as a gem. 

Bundler has multiple purposes, one of which is useful for installation.

##Local development

git clone 'url/to/this/repo/yo'
bundle install
dance

##Running the example

Edit:
```
Pusher.app_id = '765ec374ae0a69f4ce44'
Pusher.secret = '19b74451a08ea35ceed7'
Pusher.key    = '765ec374ae0a69f4ce44'
```

##About
Raptor is an open source server implementation of the Pusher protocol written
in Ruby. It is designed to scale horizontally across N nodes and to be agnostic
as to which Raptor node a subscriber is connected to, i.e subscribers to the
same channel are NOT required to be connected to the same Raptor node.
Multiple Raptor nodes can sit behind a load balancer with no special
configuration. In essence it was designed to be very easy to scale.

Presence channel state is shared using Redis. Channels are lazily instantiated
internally within a given Raptor node when the first subscriber connects. When
a presence channel is instantiated within a Raptor node, it queries Redis for
the global state across all nodes within the system for that channel, and then
copies that state internally. Afterwards, when subscribers connect or
disconnect the node publishes a presence message to all interested nodes, i.e.
all nodes with at least one subscriber interested in the given channel.

Raptor is smart enough to know if a new channel subscription belongs to the
same user. It will not send presence messages to subscribers in this case. This
happens when the user has multiple browser tabs open for example. Using a chat
room backed by presence channels as a real example, one would not want
"Barrington" to show up N times in the presence roster because Barrington is a
retard and has the chat room open in N browser tabs.

Raptor was designed to be highly available and partition tolerant with
eventual consistency, which in practise is instantaneous.

# How to use it

## Requirements

- Ruby 1.9.2-p290 or greater
- Redis

## Starting the service

Raptor is packaged as a Rubygem. Installing the gem makes the 'raptor' executable available. The `raptor` executable takes arguments, of which two are mandatory: `--app_key` and `--secret`. These can but do not have to be the same as the credentials you use for Pusher. They are required because Raptor performs the same HMAC signing of API requests that Pusher does.

__IMPORTANT:__ Redis must be running where Raptor expects it to be (either on localhost:6379 or somewhere else you told Raptor it would be using the option flag) or Raptor will fail silently. I haven't yet figured out how to get em-hiredis to treat an unreachable host as an error

<pre>
$ gem install raptor

$ redis-server &> /dev/null &

$ raptor --app_key 765ec374ae0a69f4ce44 --secret your-pusher-secret
</pre>

If all went to plan you should see the following output to STDOUT

<pre>

    ____              __            
   / __ \____ _____  / /_____  _____
  / /_/ / __ `/ __ \/ __/ __ \/ ___/
 / _, _/ /_/ / /_/ / /_/ /_/ / /    
/_/ |_|\__,_/ .___/\__/\____/_/     
           /_/                      


Raptor API server listening on port 4567
Raptor WebSocket server listening on port 8080

</pre>

## Modifying your application code to use the Raptor service

Once you have a Raptor instance listening for incoming connections you need to alter you application code to use the Raptor endpoint instead of Pusher. Fortunately this is very simple, unobtrusive, easily reversable, and very painless.


First you will need to add code to your server side component that publishes events to the Pusher HTTP REST API, usually this means telling the Pusher client to use a different host and port, e.g. consider this Ruby example

<pre>
...

Pusher.host   = 'raptor.example.com'
Pusher.port   = 4567

</pre>

You will also need to do the same to the Pusher JavaScript client in your client side JavaScript, e.g

<pre>

<script type="text/javascript">
  ...

  Pusher.host    = 'raptor.example.com'
  Pusher.ws_port = 8080
  Pusher.wss_port = 8080

</script>
</pre>

Of course you could proxy all requests to `ws.example.com` to port 8080 of your Raptor node and `api.example.com` to port 4567 of your Raptor node for example, that way you would only need to set the host property of the Pusher client.

# Configuration Options

Raptor supports several configuration options, which can be supplied as command line arguments at invocation.

<pre>
-k or --app_key This is the Pusher app key you want to use. This is a required argument

-s or --secret This is your Pusher secret. This is a required argument

-r or --redis_address An address where there is a Redis server running. This is an optional argument and defaults to redis://127.0.0.1:6379/0

-a or --api_host This is the address that Raptor will bind the HTTP REST API part of the service to. This is an optional argument and defaults to 0.0.0.0:4567

-w or --websocket_host This is the address that Raptor will bind the WebSocket part of the service to. This is an optional argument and defaults to 0.0.0.0:8080

-i or --require Require an additional file before starting Raptor to tune it to your needs. This is an optional argument

-p or --private_key_file Private key file for SSL support. This argument is optional, if given, SSL will be enabled

-b or --webhook_url URL for webhooks. This argument is optional, if given webhook callbacks will be made http://pusher.com/docs/webhooks

-c or --cert_file Certificate file for SSL support. This argument is optional, if given, SSL will be enabled

-v or --[no-]verbose This makes Raptor run verbosely, meaning WebSocket frames will be echoed to STDOUT. Useful for debugging
</pre>


# Why use Raptor instead of Pusher?

There a few reasons you might want to use Raptor instead of Pusher, e.g.

- You operate in a heavily regulated industry and are worried about sending data to 3rd parties, and it is an organisational requirement that you own your own infrastructure.
- You might be travelling on an airplane without internet connectivity as I am right now. Airplane rides are very good times to get a lot done, unfortunately external services are also usually unreachable. Remove internet connectivity as a dependency of your development envirionment by running a local Raptor instance in development and Pusher in production.
- Remove the network dependency from your test suite.
- You want to extend the Pusher protocol or have some special requirement. If this applies to you, chances are you are out of luck as Pusher is unlikely to implement something to suit your special use case, and rightly so. With Raptor you are free to modify and extend its behavior anyway that suits your purpose.

# Why did you write Raptor

I wanted to write a non-trivial evented app. I also want to write a book on evented programming in Ruby as I feel there is scant good information available on the topic and this project is handy to show publishers.

Pusher is an awesome service, very reasonably priced, and run by an awesome crew. Give them a spin on your next project.

# Author

- Stevie Graham

# Core Team

- Stevie Graham
- Mark Burns

# Contributors

- Stevie Graham
- Mark Burns
- Florian Gilcher
- Claudio Poli

&copy; 2011 a Stevie Graham joint.


