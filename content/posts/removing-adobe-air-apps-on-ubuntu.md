---
title: 'Removing Adobe Air apps on Ubuntu'
date: 2008-08-21T23:52:00.000+08:00
draft: false
aliases: [ "/2008/08/removing-adobe-air-apps-on-ubuntu.html" ]
tags : [Technology]
---

I was trying to remove AgileAgenda after fiddling with it for a week and deciding it wasn't going to cut it. There's no Adobe Air Application "uninstaller" in the menu, and search engine results usually point to Mac lurv, or not.  Seems like uninstalling Air apps on OSX is bloody.

I did find this nice [article on removing Adobe Air on Linux](http://digitalspaghetti.me.uk/index.php/DigitalSpaghetti/Remove_Adobe_AIR_in_linux) and gave it (well parts of it) a shot.

`jon@jedi-ntbk:/opt$ sudo dpkg -S /opt/*  
adobeair-enu: /opt/Adobe AIR  
com.agileagenda.agileagenda.f49a4d8df78a1fee7a3be440dc11bab18d922274.1: /opt/AgileAgenda  
de.makesoft.twhirl.0ea062bc275e7ed1e6ec3762effd73c7158adf33.1: /opt/twhirl`

I merely copied the package name of AgileAgenda, ran `dpkg` with the right switches, and pfft app's gone! Menu entry seems to be gone too.

`jon@jedi-ntbk:/opt$ sudo dpkg -P com.agileagenda.agileagenda.f49a4d8df78a1fee7a3be440dc11bab18d922274.1  
(Reading database ... 128350 files and directories currently installed.)  
Removing com.agileagenda.agileagenda.f49a4d8df78a1fee7a3be440dc11bab18d922274.1 ...  
jon@jedi-ntbk:/opt$`