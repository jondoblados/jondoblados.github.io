---
title: 'Export TweetDeck groups in Ubuntu'
date: 2009-05-28T05:20:00.000+08:00
draft: false
aliases: [ "/2009/05/export-tweetdeck-groups-in-ubuntu.html" ]
tags : [GNU/Linux, Ubuntu, Technology]
---

If you have multiple installs of TweetDeck on different computers, I bet you wished there were ways to save the groups you set up. These groupings are not saved in your Twitter profile, but are kept in a local database in your computer. This means that for each install of TweetDeck, you will have to re-set up your groups, and any changes won't replicate to your other installs.

This [post](http://bit.ly/ljKUO) about copying TweetDeck settings in Windows explains this in detail, and I have been able to do the same for Ubuntu, replicating TweetDeck settings across 3 machines. Just take note of some of the differences that I'm going to point out here.

Adobe Air for Linux uses the `.appdata` directory in your home directory, for profile settings, configurations, etc. In the computer that has your groups and is the source for the export, change working directory into `.appdata`, and look for the `TweetDeckFast.{some hash here}`.

`jon@jedi-ntbk:~$ cd .appdata  
jon@jedi-ntbk:~/.appdata$ ls  
Adobe  
cookie_file.txt  
de.makesoft.twhirl.0EA062BC275E7ED1E6EC3762EFFD73C7158ADF33.1  
jrcf_H7t6Ap  
jrcf_RA5I7w  
jrcf_wdLW48  
Snippage.B28FB424FD6880E47B18D7D649F6CC93BDE9B29B.1  
TweetDeckFast.F9107117265DB7542C1A806C8DB837742CE14C21.1  
jon@jedi-ntbk:~/.appdata$`

Change directory to the one that says `TweeDeckFast` and list the contents. Change directory into `Local Store` and you should find two files that has your username. In my case, they are

`preferences_jjdoblados.xml  
td_26_jjdoblados.db`

Simply copy these two files to any target machine in the same directory where you got them. Make sure that TweetDeck is closed before copying. When done copying, start TweetDeck and you will have all of your groups intact!