Raptor let's you build realtime Ruby, Rails and Javascript apps.

## Introduction 

Raptor is a realtime messaging and presence server written in Ruby.
Raptor is based on the Pusher and Bayeux Protocol. 
It's built for anyone who wants to run and manage their own realtime messaging server.
The architecure uses EventMachine for concurrency, Websockets for realtime communication and a Redis server to manage pub/sub messages.
Raptor is built to scale horizontally across many instances because they all use the same Redis datastore.

### Why

We've used Pusher before in previous projects but when we started building Medeo, we could no longer use a hosted a solution because the healthcare industry is extremely regulated by the Health Information Protection Act (HIPA).
In the beginning we used Faye and ran our own pub/sub server but it lacked proper presence and authentication support (we had to write our own).
We wanted to keep the Bayeux Protocol, which is a way of registring realtime resources at a URL,
but keep Pusher's idea of three types of channels: public, private and presence. 

TODO: give a reason why I did this and not xmpp

### Raptors

Because we love Jurassic Park(http://www.youtube.com/watch?v=TO5wryDdEI0) and the Toronto Raptors.

### Features

Authentication - use your Ruby app to authenticate users's access to a channel
Webhooks - get notified about events that occur within Raptor
Presence - see who's online and get notified when they leave or join
Scalable - Raptor stays in-sync across many as many instances as you need
Secure - use SSL to secure your websockets

Next up:

Ruby API for channel information (being worked on)
Wild card channels - last missing piece of the the Bayeux protocol
Statistics - get event and presence statistics
Web interface - manage Raptor nodes and visualize statistics

# Getting Started

gem install raptor
raptor

``

- clone
- 

# Advanced

## Changing port information



channel_id is the "/channel_type/channel_name"

iternally, the channel type includes the leading and trailing slash, so even though we say it's of type "presence"
in redis we always store "/presence/"


how do I raise the log level for the js file?
