Raptor let's you build realtime Ruby, Rails and Javascript apps.

## Introduction 

Raptor is a realtime messaging and presence server written in Ruby.
It's built for anyone who wants to run and manage their own realtime messaging server.
The architecure uses EventMachine for concurrency, Websockets for realtime communication and Redis for scaling.

The velociraptor is also the best dinosaur that ever lived and means "quick-thief".

### Why

History lesson:

I loved using Pusher on previous projects but when we (https://www.medeo.ca/about) started building Medeo, using a hosted a realtime server that was not our own (like Pusher) was no longer an option because the healthcare industry is extremely regulated by the Health Information Protection Act (HIPA).
At Medeo, we used Faye for over a year for simple realtime messaging and it was exactly what we needed. But as we grew, we needed more from Faye: like better awareness of who's online and also better privacy control. So, we set off to explore two other options: using XMPP (http://prosody.im/) or rolling our own messaging server (codenamed 'Raptor'). 
In the end: we chose to stick to Faye after incorporating a lot of what we wrote in Raptor as extensions for Faye.

I still use Raptor a lot on personl projects since our custom version of Faye is overkill. (write about why I opensourced it)

### Raptors

Because Jurassic Park (http://www.youtube.com/watch?v=TO5wryDdEI0)

### Features

Authentication - use your Ruby app to authenticate users's access to a channel
Webhooks - get notified about events that occur within Raptor
Presence - see who's online and get notified when they leave or join
Scalable - Raptor stays in-sync across as many instances as you need
Secure - use SSL to secure your websockets

Next up:

Channel message permissions - restrict some members knowing about others on a channel 
Wild card channels
Statistics - get event and presence statistics
Web interface - manage Raptor nodes and visualize statistics

# Getting Started

```
$ git clone 'url/to/raptor-server/repo'
$ cd raptor-server
$ bundle install
```

To launch the server:

```
$ raptor
```


# Channels

