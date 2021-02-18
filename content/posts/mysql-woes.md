---
title: 'mysql woes'
date: 2005-07-13T07:37:00.000+08:00
draft: false
aliases: [ "/2005/07/mysql-woes.html" ]
---

In my quest to have my "dead" blog resuscitated on our new p5 server so that I have something to use for my tech notes here at work as well as my MS requirements, I downloaded `MySQL-4.1.12-0.sles9.src.rpm` from [mysql.com](http://www.mysql.com) in the hope of getting [Wordpress](http://wordpress.org) running on our server. I can't seem to install the darn thing. So I dl'ed `mysql-standard-4.1.12-unknown-linux-gnu-powerpc-glibc23.tar.gz` and tried to use the binaries instead.  
  
Viola! MySQL4.1.12 managed to run fine. The only problem is that even with all the usual accounts set up, including privileges and access rights to hosts set up correctly, wordpress can't connect to the localhost database. Baaaaad!!! I ended up setting up the database on my trusty workstation and connected to that instead.  
  
[Technorati Profile](http://www.technorati.com/claim/2huq9dg32)