---
title: "plesk won't start after tweaking mysql"
date: 2007-08-14
category: tech
published: true
comments: true
---

i've had this happen to me again the other week and as always, felt like kicking myself for not remembering.

we do a lot of performance tuning on mysql, and as a result, we almost always manage to get plesk mangled. not its fault, it just can't run without mysql, doh.

not of preference, but plesk happens to be there to make handling domains easier, as a single editing point when you want to change something and not worry about missing something out.

so there's a custom `/etc/my.cnf` that we use, and with changes to limits done (both on mysql and via ulimit), you'd think that a reload of mysqld would do. (we use InnoDB btw)

normally, that's all you need to have mysqld read off the new settings. if you've grown so dependent on plesk (like i have), you would not notice that mysqld didn't actually start, and you will get an error when you load plesk, thinking that it's a plesk error:

```bash
ERROR: PleskMainDBException
MySQL query failed: Incorrect information in file: './psa/misc.frm'
0: /usr/local/psa/admin/plib/common_func.php3:218
db_query(string 'select param, val from misc')
1: /usr/local/psa/admin/plib/common_func.php3:497
get_param(string 'mysql41_compatible')
2: /usr/local/psa/admin/plib/common_func.php3:394
db_set_names()
3: /usr/local/psa/admin/plib/common_func.php3:373
db_connect_real(string 'localhost', string 'admin', string '********', string 'psa')
4: /usr/local/psa/admin/plib/common_func.php3:353
db_connect()
5: /usr/local/psa/admin/auto_prepend/auth.php3:82
```

even a restart of the plesk service will not work:

```bash
[root@jedi]# /etc/init.d/psa restart
Unable to query parameter by query select val from misc where param='mysql41_compatible': Incorrect information in file: './psa/misc.frm'
Unable to query parameter by query select val from misc where param='mysql41_compatible': Incorrect information in file: './psa/misc.frm'
Mysql error: Incorrect information in file: './psa/key_history.frm'
Processing config directory: /usr/local/psa/admin/conf/httpsd.*.include
Syntax OK
/usr/local/psa/admin/bin/httpsdctl restart: httpd restarted
ERROR 1033 (HY000) at line 1: Incorrect information in file: './psa/sessions.frm'
```

so this is a mysqld failing to start properly problem. to fix this, go to your mysql datadir and see if the sizes of your innodb log files match those in your .cnf. we usually set `innodb_log_file_size = 256M` and `innodb_log_buffer_size = 256M` in `/etc/my.cnf`.

if they don't match, stop mysqld, remove the `ib_logfile0` and `ib_logfile1` files, and start mysqld. be careful not to delete the `ibdata1` or `ibdata2` files or you lose your data. avoid using `rm -r ib*` (yea, wildcards and fast fingers give sysads their most stupefying moments)

innodb will recreate the log files to match your .cnf and mysqld now becomes available for plesk.
