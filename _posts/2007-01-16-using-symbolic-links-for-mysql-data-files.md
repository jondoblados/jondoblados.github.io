---
title: "Using symbolic links for MySQL data files"
date: 2007-01-16
category: tech
published: true
comments: true
---

Over a year ago, we had several servers configured for high traffic websites. A mispartioning resulted in `/var` becoming obscenely small, and it was only after MySQL crashed that we remembered this. We couldn’t afford more downtime if we dealt with the partition size problem, so I thought of quickly moving the data files into `/home/mysql/{dbname}` from `/var/lib/mysql/{dbname}` and create the symlink `/var/lib/mysql/{dbname} -> /home/mysql/{dbname}`.

I was not certain of the performance implications to this. I heard from a fellow Linux junkie here that there may be a slight penalties in terms of access speed, since `/home` was meant for generic read/write, whereas `/var` was accessed in a very quick manner. Gotta verify this. But for now, I dwell in the power of symbolic links.
