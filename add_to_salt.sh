#!/bin/bash
grep server_$1 /etc/salt/roster|grep -v ^# >>/dev/null
if [ $? -ne 0 ]
then
    echo -e "\nserver_$1:\n  host: $1\n  user: $2\n  passwd: $3\n  sudo: False" >>/etc/salt/roster
fi
