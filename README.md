Raptor let's you build realtime Ruby, Rails and Javascript apps.

## Introduction 

Raptor is a realtime messaging and presence server written in Ruby.
Raptor is based on the Pusher Protocol and built for anyone who wants to run and manage their own realtime messaging server.
The architecure uses EventMachine for concurrency, Websockets for realtime communication and a Redis server to manage pub/sub messages.
Raptor is built to scale horizontally across many instances because they all use the same Redis datastore.

### Why

We loved using Pusher in previous projects but when we started building Medeo, we could no longer use a hosted a solution because the healthcare industry is extremely regulated by the Health Information Protection Act (HIPA).

### Raptors

Because we love Jurassic Park(http://www.youtube.com/watch?v=TO5wryDdEI0) and the Toronto Raptors.

### Features

Authentication - use your Ruby app to authenticate users's access to a channel
Webhooks - get notified about events that occur within Raptor
Presence - see who's online and get notified when they leave or join
Scalable - Raptor stays in-sync across many as many instances as you need
Secure - use SSL to secure your websockets

Next up:

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



