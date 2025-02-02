+++
title = "mysql woes"
date = 2005-07-13T07:37:00Z
updated = 2014-02-12T04:47:21Z
blogimport = true 
[author]
	name = "Jon Doblados"
	uri = "https://plus.google.com/114642277785568765419"
+++

In my quest to have my "dead" blog resuscitated on our new p5 server so that I have something to use for my tech notes here at work as well as my MS requirements, I downloaded <code>MySQL-4.1.12-0.sles9.src.rpm</code> from <a href="http://www.mysql.com">mysql.com</a> in the hope of getting <a href="http://wordpress.org">Wordpress</a> running on our server. I can't seem to install the darn thing. So I dl'ed <code>mysql-standard-4.1.12-unknown-linux-gnu-powerpc-glibc23.tar.gz</code> and tried to use the binaries instead.<br/><br/>Viola! MySQL4.1.12 managed to run fine. The only problem is that even with all the usual accounts set up, including privileges and access rights to hosts set up correctly, wordpress can't connect to the localhost database. Baaaaad!!! I ended up setting up the database on my trusty workstation and connected to that instead.<br/><br/><a href="http://www.technorati.com/claim/2huq9dg32" rel="me">Technorati Profile</a>
