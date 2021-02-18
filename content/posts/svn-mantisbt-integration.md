---
title: 'SVN-MantisBT Integration'
date: 2010-11-09T02:14:00.000+08:00
draft: false
aliases: [ "/2010/11/svn-mantisbt-integration.html" ]
tags : [GNU/Linux, Systems Administration, Bug Tracking, Revision Control]
---

  
![04](http://jon.doblados.net/wp-content/uploads/2010/11/04.png.scaled500-300x196.png)  

  
I've downloaded and installed MantisBT 1.2.3stable on linode2, and after fixing permissions issues, proceeded with the installation. I stopped when I realized I didn't have the same MantisBT version on the old server. It's always better to set up MantisBT on the target server "as is", and let the install scripts handle the upgrade.

  

I'm roughly 28% in with a server-to-server SCP of a 79Mb MySQL dump of our bugtracker. I haven't had time to check with the backups since I felt that a fresh dump is always best; but no, I remembered that several developers preferred working odd hours and they would definitely need the bug tracker up.

  

Next up, install the different source and meta plugins needed to make this mashup work. Excellent guide [here](http://leetcode.net/blog/2009/01/integrating-git-svn-with-mantisbt/).