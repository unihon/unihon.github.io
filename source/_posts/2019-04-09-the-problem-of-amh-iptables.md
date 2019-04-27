---
layout: post
title: the-problem-of-amh-iptables
categories:
  - linux
tags:
  - iptables
  - centos
  - init
asciinema: false
date: 2019-04-09 13:08:41
updated: 2019-04-09 13:08:41
---

使用amh v4.2面板时的防火墙问题。

主机系统为Centos 6.10，防火墙为iptables v1.4.7。

最初目的为永久的关闭防火墙，所以使用`chkconfig iptables off`和`chkconfig ip6tables off`，将iptables的符号连接从各系统启动等级中移除。

{% asset_img 20190409_chkconfig_list.png %}
▲ 禁用iptables的开机自启动

随后`reboot`重启主机，验证是否“永久”的将iptables禁用了。但是在开机后执行`services iptables stauts`发现iptables是正在运行的状态，再次查看利用`chkconfig`查看iptables的启动等级设置并没有“异常”，各个启动等级都为“off”。

{% asset_img 20190409_iptables_status.png %}
▲ 重启后查看iptables状态，并没能“永久”禁用iptables

后面排查`~/.bashrc`、`~/.bash_profile`、`/etc/profile`、`/etc/profile.d/`，都没有找到与启动iptables相关的命令。

于是，就干脆把iptables的规则文件`/etc/sysconfig/iptables`给删除了吧，这样iptables就无法启动了。

{% asset_img 20190409_iptables_rm.png %}
▲ 删除iptables规则文件，并测试

最后再`reboot`重启主机验证下...出乎意料的是，iptables还是自动启动了，而且防火墙的规则与之前似乎并没有变化。

{% asset_img 20190409_iptables_status.png %}
▲ 重启后再次查看iptables状态，但还是自动启动了

于是乎，我在想规则文件`/etc/sysconfig/iptables`是不是没有引用，为此，我使用`iptables-save > /etc/sysconfig/iptables`将当前的规则导出，并在此基础上添加一个规则。

{% asset_img 20190409_iptables_route.png %}
▲ 新添加一条防火墙规则 

随后执行`services iptables restart`重启iptables，并执行`iptables -L -n`查看防火墙规则。

{% asset_img 20190409_iptables_l.png %}
▲ 新添加的防火墙规则，生效

可见，规则文件`/etc/sysconfig/iptables`是有引用的，但是，为什么先前在删除iptables的规则文件后，自己手动`stop`、`start`明明是可以使得iptables因为找不到规则文件而启动失败的，而在`reboot`重启主机后iptables却能够照常启动。

再次`reboot`重启主机。

{% asset_img 20190409_iptables_status.png %}
▲ 重启后查看iptables状态

在重启主机后查看iptables状态，iptables正在运行中，关键的是，刚刚在规则文件中新添加的规则并没有在使用到当前的规则中，规则文件`/etc/sysconfig/iptables`依然还有自己添加的规则，并没有“被改动”。

可以推断出，在系统启动时，iptables应该并不是从`/etc/sysconfig/iptables`中加载规则。

在排除了`~/.bashrc`之类文件后，我开始在`/etc/init.d/`下寻找怀疑对象。

{% asset_img 20190409_ls.png %}
▲ `/etc/init.d/`目录里的内容

这个**amh-start**一看就很可疑啊...

{% asset_img 20190409_amh_start.png %}
▲ `/etc/init.d/amh-start`文件内容

{% asset_img 20190409_chkconfig_list_amh.png %}
▲ 查看amh-start的启动信息

这下什么都明白了。

回到上面的问题：

为什么永久禁用iptables不生效；为什么明明没有规则文件，在重启主机后iptables却依然能够自动启动。

因为每次系统启动都会执行amh-start脚本，里面的`iptables-restore`从`/etc/amh-iptables`中导入防火墙规则。

要永久禁用iptables，将这条`/sbin/iptables-restore < /etc/amh-iptables`注释掉即可。

注：iptables-restore也会启动iptables
