+++
title = "Using Google Talk with Kopete"
date = 2006-07-21T09:26:00Z
updated = 2014-02-12T04:47:21Z
blogimport = true 
[author]
	name = "Jon Doblados"
	uri = "https://plus.google.com/114642277785568765419"
+++

I absolutely love Gaim, but the message to group feature isn't readily available, even with gaim2-beta3, and this doesn't work for me especially that I sometimes need to broadcast messages to team members over IM. Quick googling led me to Frank Spychalski's very good <a href="http://amazing-development.com/archives/2006/01/20/using-google-talk-with-kopete/">article</a>, which covers the essentials of configuring Google Talk on Kopete. For Ubuntu users, if you don't have Kopete yet, you will need an internet connection to get the necessary packages.<code><br /><br />$ sudo apt-get install -y kopete qca-tls</code><p />The <code>qca-tls</code> package will ensure that you'll be able to connect using the default encryption protocol. After these packages install, start Kopete, and create a new Jabber account if you don't have it yet. On the first tab, set up your Jabber ID to use your Gmail address:<br /><code><br />Jabber Id: &lt;yourid&gt;@gmail.com</code><p />On the "Connection" tab, use <code>talk.google.com</code> as your server and  tick all the boxes like so:<p /><code>[x] Use protocol encryption (SSL)<br /> [x] Allow plain-text password authentication<br /> [x] Override default server information<br />     Server: [talk.google.com]         Port: [5223]</code><p />Done!
