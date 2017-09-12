#!/bin/bash
line=`grep -n "server_$1:" /etc/salt/roster|cut -d: -f1`
line_last=$(($line+4))
sed -i "$line,${line_last}d" /etc/salt/roster
