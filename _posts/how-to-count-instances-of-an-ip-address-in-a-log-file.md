+++
title = "How to count instances of an IP address in a log file"
date = 2010-07-24T20:00:00Z
updated = 2014-02-12T04:43:24Z
tags = ["Hosting", "GNU/Linux", "Systems Administration"]
blogimport = true 
[author]
	name = "Jon Doblados"
	uri = "https://plus.google.com/114642277785568765419"
+++

I was looking for a quick and painless way to determine what IP addresses used our web app the most and stumbled across this excellent [post](http://encodable.com/tech/blog/2008/12/17/Count_IP_Addresses_in_Access_Log_File_BASH_OneLiner). I got reminded of the power of the command-line interface and that often, I underestimate the way these commands are supposed to make a sysad's life easier.

So here's a quick tip for counting unique visitors to your web app. Locate your web app's log file and do a quick scan of the last few lines. In my case, this is what I saw:
```bash
112.198.79.223 - - [10/Jul/2010:00:57:29 -0400] "POST /v2/api/execute.php?method=upload_time&amp;ver=win1.1.15 HTTP/1.1" 200 116 "-" "Mozilla/5.0"
117.241.112.254 - - [10/Jul/2010:00:57:30 -0400] "POST /v2/api/execute.php?method=timestat&amp;ver=win1.1.15 HTTP/1.1" 200 288 "-" "Mozilla/5.0"
80.249.84.105 - - [10/Jul/2010:00:57:29 -0400] "POST /v2/api/execute.php?method=offtime&amp;ver=win1.1.15 HTTP/1.1" 200 19 "-" "Mozilla/5.0"
117.241.112.254 - - [10/Jul/2010:00:57:32 -0400] "POST /v2/api/execute.php?method=get_defaults&amp;ver=win1.1.15 HTTP/1.1" 200 77 "-" "Mozilla/5.0"`
```
In this log format, the IP address appears first, so we will only need to get the first set of characters, separated by a space. In order to count instances of an IP address, we sort the IP addresses so similar IP addresses are grouped together, then count them. Then we sort them again so that the sums are arranged. The number of unique IPs may give you pages of standard output, so optionally, if you only want to see which IP addresses accessed the web app the most, we look at the top results only.<

So these are the commands used, piped one after the other, with the output:

```bash
[root@server2 ~]# cat /var/log/httpd/access_ssl.log | awk '{print $1}' | sort | uniq -c | sort -nr | head
71612 216.157.78.237
34094 120.28.205.244
30091 119.93.97.54
25078 120.28.214.104
18949 120.28.195.151
17929 58.107.64.40
14877 212.98.174.235
14752 117.241.112.143
14429 120.28.247.74
12864 117.241.113.183
[root@server2 ~]#
```
Happy counting, err reporting!