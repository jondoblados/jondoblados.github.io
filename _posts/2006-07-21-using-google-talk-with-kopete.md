---
title: "Using Google Talk with Kopete"
date: 2006-07-21
category: tech
published: true
comments: true
---

I absolutely love Gaim, but the message to group feature isn't readily available, even with gaim2-beta3, and this doesn't work for me especially that I sometimes need to broadcast messages to team members over IM. Quick googling led me to Frank Spychalski's very good [article](http://amazing-development.com/archives/2006/01/20/using-google-talk-with-kopete/), which covers the essentials of configuring Google Talk on Kopete.

For Ubuntu users, if you don't have Kopete yet, you will need an internet connection to get the necessary packages.

```bash
$ sudo apt-get install -y kopete qca-tls
```

The `qca-tls` package will ensure that you'll be able to connect using the default encryption protocol. After these packages install, start Kopete, and create a new Jabber account if you don't have it yet. On the first tab, set up your Jabber ID to use your Gmail address:

```plaintext
Jabber Id: <yourid>@gmail.com
```

On the "Connection" tab, use `talk.google.com` as your server and tick all the boxes like so:

```plaintext
[x] Use protocol encryption (SSL)
[x] Allow plain-text password authentication
[x] Override default server information
	Server: [talk.google.com]
	Port: [5223]
```

Done!
