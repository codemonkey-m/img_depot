#!/usr/bin/python
# -*- coding:utf-8 -*-

import os

def system(cmd):
    r = os.popen(cmd)
    t = r.read()
    r.close()
    return t

cwd = os.getcwd()
print('当前路径 ' + cwd)

try:
    open('assets/js/cfg.js', 'r')
except Exception as e:
    server_url = raw_input('首次启动需输入服务器地址,例如: 192.168.1.222:808:\n')
    cfg = open('assets/js/cfg.js', 'w')

    cfg.write('''
    var url = "http://%s/"
    exports.url = url
    ''' % server_url)
    cfg.flush()
    cfg.close()
    

ids = system('pidof node').split(" ")
for pid in ids:
    if len(pid) == 0:
        continue

    pid = pid.replace('\r', '').replace('\n', '')
    if cwd in system('ls -l /proc/%s/cwd' % pid):
        print('原进程pid为 %s' % pid)
        system('kill -9 %s' % pid)
        break

print('启动新进程.')
system('nohup node main.js >/dev/null 2>&1 &')
