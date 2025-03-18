---
title: "More Plesk Blues"
date: 2008-08-21
category: tech
published: true
comments: true
---

I've had this problem with Plesk since I started relying heavily on it in 2006. For some reason, after you've added your client, allocated IP address to client's pool, added a domain, and selecting physical hosting, you get the message:
> Unable to update hosting preferences: hosting update is failed: object ID is invalid

After getting this error, you get the domain listed, but still requiring set up. Attempting to complete physical hosting setup will give you same result. First thing you'd want to look at would be some log.  For all of its peculiarities, Plesk has an organized directory tree.  Look at `/usr/local/psa/admin/logs/httpsd_error_log` and you'll see that skeleton or template is missing.

I didn't know exactly where to get the `.skel` directory, but some Googling led me to `/home/httpd/vhosts/.skel/0`, which after some directory skimming, I was able to verify as non-existent.  I simply copied an existing `.skel` directory from one of our other servers and redid the physical hosting setup.

I'll see if I can find out what's causing the `.skel` directory to cease to exist. This is a fairly easier to solve issue. I so need to start looking in forums of Parallels (formerly SWSoft) for solutions.