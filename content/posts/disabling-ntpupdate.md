---
title: 'Disabling ntpupdate'
date: 2006-03-13T03:24:00.000+08:00
draft: false
aliases: [ "/2006/03/disabling-ntpupdate.html" ]
---

This has been quite overdue, as I have been wanting to disable `ntpupdate` since the Hoary release. What is `ntpupdate` anyway? It's the program that synchronizes your system time to an ntp server. NTP is a protocol for synchronising the clocks of computer systems over packet-switched, variable-latency data networks. Since Ubuntu defaults to an ntp server somewhere in the www, and that it will attempt to sync on boot, it causes your machine to go through a much much longer startup process if an internet connection is not available at boot time.  
  
As I am lugging my lappy around a lot and I have not much of a need for the program, I knew I had to take it out and save me minutes of boot time. [Ealden](http://blog.ealden.net) taught me how to remove `ntpupdate`, and I suppose we can change the arguments to remove other programs as well.  
  
`$ sudo update-rc.d -f ntpdate remove`  
  
`update-rc.d` will remove any system startup links for `/etc/init.d/ntpdate`, or any instances of such in the different run levels. Usage is as follows:  

  

```
usage: update-rc.d \[-n\] \[-f\] <basename> remove  
       update-rc.d \[-n\] <basename> defaults \[NN | sNN kNN\]  
       update-rc.d \[-n\] <basename> start|stop NN runlvl \[runlvl\] \[...\] .  
                -n: not really  
                -f: force
```