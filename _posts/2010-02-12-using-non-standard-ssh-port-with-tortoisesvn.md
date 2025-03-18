---
title: "Using non-standard SSH port with TortoiseSVN"
date: 2010-02-12
category: tech
published: true
comments: true
---

Some of my students reported that they were having problems connecting to their repositories using <a href="http://tortoisesvn.tigris.org/">TortoiseSVN</a>. At first, quick checks from my end didn't reveal what caused these, but I realized soon that it wasn't a server issue. It seems like the client software that they were using (TortoiseSVN) didn't know what to make of the `svn+ssh://[user]@[ip]:[port]/[repo]` URL.

I use [RabbitVCS](http://www.rabbitvcs.org/) on my Linux boxen and get the same "Network connection closed unexpectedly" message. A colleague at work suggested that since a non-standard port for SSH is used, I should modify my `/home/<username>/.subversion/config`, look for the `[tunnels]` section, and append `-p [port number]` for the svn tunnel named ssh. Since this particular repository is just one among the dozens I access, I can't modify the default svn tunnel. Instead, I added a custom tunnel for each of the servers that use non-standard SSH ports.

For the repo that my students were trying to access, I used `ssh2212 = $SVN_SSH ssh -q -o ControlMaster=no -p 2212`. So the URL now looks like `svn+ssh2212://[user]@[ip]:2212/[repo]` and I was able to connect successfully.

In Windows, there are several ways to do this. Since the OS doesn't have a native SSH client executable, users will rely on Cygwin, Putty, or on TortoisePlink.exe (in newer versions of TortoiseSVN).

You can try any of the following solutions (they're all searchable on the Internet) and see if you can get around the problem. I've tried them all on a Windows guest OS on VirtualBox and only the last three solutions worked.

- **Using Putty**: Use saved session name from Putty in the URL: `svn+ssh://[user]@[saved putty session name]/[repo]`. Make sure that you configure the session to already use the correct port.
- **Using Putty**: Alternately, use `IP:port` format for the Putty saved session name so that you still use the `svn+ssh://[user]@[ip]:[port]/[repo]` URL format, but you're actually calling the saved session name.
- **Using client packaged with Tortoise**: In TortoiseSVN settings -> Network, change SSH client to `"C:\Program Files\TortoiseSVN\bin\TortoisePlink.exe"` and use standard `svn+ssh://[user]@[ip]:[port]/[repo]` URL.
- **Same as above**, but for the SSH client, append `-P [port number]`.
- **Using a wrapper script**, such as the one provided [here](http://unformatt.com/news/non-standard-ssh-ports-with-tortoise-svn/) (excellent solution btw), and use it as the SSH client executable in TortoiseSVN settings -> Network.

Hope any one of these work for you. As an inside joke from one of my sysad friends, it was also suggested that I save myself the troubles and just log in to the server and revert to the default SSH port. LOL.
