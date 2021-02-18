---
title: 'CSI: Season Finale'
date: 2005-07-27T07:36:00.000+08:00
draft: false
aliases: [ "/2005/07/csi-season-finale.html" ]
---

I am one with the millions of CSI fans raring to watch the 2-hour season finale of the top rated series on television. Quentin Tarantino has been tapped to direct this one and I'm sure it'll be a very, very good 2 hours. My daughter needs to sleep a good hour before that starts because she won't sleep if she sees CSI on. Like father, like daughter.  
  
I posted this on my [tech blog](http://trigger.cdo.linux.org.ph), but I feel that I'll probably have more people see it here in LJ, which will hopefully translate to more ready answers for me. I did a script that displays my planner's buffer files. It would've been easier if I used emac's wiki publishing, but I wanted to format the output so that it'll look good on wp, and decided on it otherwise. Save for some quirks on the display, my tasks list shows up just fine.  
  
I was asking around earlier about system-dependent directory reading methods. I couldn't get my display to sort properly. So what exactly is the order in which directory items are fetched? In the php manual:  

>   
> Note:  
> The order in which directory entries are returned by the read method is system-dependent.

  
I would assume that a system read from a directory will return an alphanumerically sorted list, but I had the feeling that it isn't the case here. I used the `[dir](http://ph.php.net/manual/en/class.dir.php)` class (readily available in php3 and up).  

> A pseudo-object oriented mechanism for reading a directory. The given directory is opened. Two properties are available once the directory has been opened. The handle property can be used with other directory functions such as readdir(), rewinddir() and closedir(). The path property is set to path the directory that was opened. Three methods are available: read, rewind and close.

  
No parameters passed to any of these three methods. Sucks.