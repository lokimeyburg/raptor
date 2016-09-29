raptor let's you build realtime Ruby, Rails and Javascript apps.

## Introduction

Raptor is a realtime messaging and presence server written in Ruby.
It's built for anyone who wants to run and manage their own realtime messaging server.
The architecure uses EventMachine for concurrency, Websockets for realtime communication and Redis for scaling.
Raptor takes a lot of inspiration from the Pusher protocol (http://www.pusher.com) - basically it started as an excercise to copy it.
The velociraptor is also the best dinosaur that ever lived and means "quick-thief".

### Why

Raptor started as a project to build my own messaging server to replace Faye because I needed a better way to know who was online and also because I needed to control who knew who was online. I really liked how Pusher used different types of channels to expose more features and security, so I started implementing their three main channel types: public, private and presence channels. I added a fourth type of channel called a 'privilaged' channel which let's only privilaged users see who's online and be able to publish messages on the channel (think UNIX-style permissions). Raptor also uses URLs to define realtime resources since this leads to a more RESTful implementation.

To subscribe to realtime comments on your photo gallery, you'd subscribe to: 

```
/channels/private/my-photo-gallery/comments
```

This is what the URL structure means:

```
/private: the type of channel we're subscribing to

/my-photo-gallery/comments : the url we're subscribed to
```

To publish a comment on your photo gallery, you'd publish it to the same URL: 

```
/channels/private/my-photo-galleries/123/comments
```

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

There are three types of channels: public, private and public.

### Public channels






# History at Medeo

History lesson:

I loved using Pusher on previous projects but when we (https://www.medeo.ca/about) started building Medeo, using a hosted a realtime server that was not our own (like Pusher) was no longer an option because the healthcare industry is extremely regulated by the Health Information Protection Act (HIPA).
At Medeo, we used Faye for over a year for simple realtime messaging and it was exactly what we needed. But as we grew, we needed more from Faye: like better awareness of who's online and also better privacy control. So, we set off to explore two other options: using XMPP (http://prosody.im/) or rolling our own messaging server (codenamed 'Raptor').
In the end: we chose to stick to Faye after incorporating a lot of what we wrote in Raptor as extensions for Faye.

I still use Raptor a lot on personl projects since our custom version of Faye is overkill. (write about why I opensourced it)
