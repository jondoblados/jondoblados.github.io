---
title: 'PIIX3 cannot attach drive to the Secondary Master'
date: 2009-01-30T13:12:00.000+08:00
draft: false
aliases: [ "/2009/01/piix3-cannot-attach-drive-to-secondary.html" ]
tags : [GNU/Linux, Systems Administration]
comments : true
---

I use [VirtualBox](http://www.virtualbox.org "VirtualBox") for my server experimenting requirements, and it's just great!  Just this morning, I got an error message when I started an FC8 virtual machine.

`PIIX3 cannot attach drive to the Secondary Master.  
VBox status code: -102 (VERR_FILE_NOT_FOUND).`

This [thread](http://forums.virtualbox.org/viewtopic.php?p=805 "PIIX3 cannot attach drive to the Secondary Master") in the forums explains that the virtual machine was looking for a disk that was supposed to be mounted and could not find it.  I was using an external DVD drive and had removed it before I shut down the VM.

You'd get the same problem if you set up a VM to use a mounted disk or some other mass storage device.  To fix this, simply uncheck the non-existent devices in the VM settings while the VM is powered down.  Alternately, you can plug the devices back in before you power up the VM.

If after doing these steps you still get the error, check if the devices do get mounted and are accessible from the host as you may be dealing with broken or non-functional devices.