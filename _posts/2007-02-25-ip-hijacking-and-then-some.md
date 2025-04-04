---
title: "IP-hijacking and then some"
date: 2007-02-25
categories: tech musings
published: true
comments: true
#tags = ["Hosting", "Domains"]
---

Almost a month of downtime. The servers were fine, but our IP addresses were not. Somehow, a system bug from one of the hosting companies caused our plan to include 14 other IP addresses, and we only maintained 6 as far as I am concerned.

So the hosting company eventually understood what was happening and started asking the right questions. The bug is that the system allowed network administrators to assign to new clients, the IP addresses that have already been assigned to a current client.

We spent crazy hours figuring out what happened. Since the domains were not loading our sites, and instead were redirecting to some domains we don’t own (real bad sites btw), we checked if .htaccess was modified and tested if it was working at all. I also did double checks on virtual host configurations and they all looked clean.

I started thinking that it was a routing issue. We were not using the publicly routable IPs for the virtual hosts; instead, we used internal IPs as mapped to the firewall hardware. A lookup on the domain/s that we were being redirected to reported different IP addresses, which didn’t readily confirm my suspicions, but stressed the possibility of IP-hijacking.

It’s not supposed to be taken in the context of BGP (border gateway protocol), as this is beyond me. Instead, think of your assumption over IP addresses that we’re using, to serve your websites. Sounds clear? I hope it does. I got pretty lost myself and it isn’t after deep digging at the hosting company’s end that their errors became apparent.

So in the light of this realization, I’ve already moved the domains to some other hosting. Way too much work and way uncool.