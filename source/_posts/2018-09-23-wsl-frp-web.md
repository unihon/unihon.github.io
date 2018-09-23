---
layout: post
title: use wsl and frp build web server
date: 2018-09-23 15:48:57
updated: 2018-09-23 15:48:57
categories:
- linux
tags:
- linux
- wsl
- frp
---

利用windows的linux子系统配合frp来搭建个人的网站服务器，利用这个wsl上面的服务器对个人的开发比较方便，方便是恐怕是最直接的好处了吧，毕竟就是开启一个uwp应用一样的点一下...

**wsl和虚拟机相相比优势**
* 安装方便：直接在windows store下载，不需要虚拟机
* 文件共享方便，电脑盘挂载在`/mnt/`目录下，虚拟机一般还要安装各种工具，如virtualbox
* 使用方便，打开uwp应用，或者在cmd、pw输入`wsl`命令

**wsl和虚拟机相相比缺点**
* 子系统功能还不完善，部分功能缺失，如`systemctl`等的命令还没支持

## wsl基本安装步骤

![](/2018-09/wsl-frp-web/set.png)
▲ 开启子系统功能

![](/2018-09/wsl-frp-web/store.png)
▲ windows store 上面的linux版本

以debian为例，安装完成之后，根据提示完成设置。输入`sudo passwd root`设置root的密码，`su -`切换root身份。`apt update`更新apt源（这里可以更改国内的apt源，应该会快点，配置文件是`/etc/apt/sources.list`），之后便可输入`apt install apache2`安装web服务器，对于其他软件同理。

因为`systemctl`不能用（在github上面看了下，应该是目前还没支持），所以得用`service`管理程序服务（个人之前一直是用centos，所以这个命令是基本没怎么用，突然感觉`systemctl`好方便(/▽＼)）。  
`service apache2 start`启动服务，对应`status`查看状态，`stop`停止服务。

![](/2018-09/wsl-frp-web/bash.png)
▲ 启动apache
 
还有就是貌似`update-rc.d`这个命令控制的程序自启动没生效（有成功的可以call me），所以在家目录下的`.bashrc`文件下面加上下面这条命令来实现“程序自启动”。  
`echo "your user passwd"|sudo service apache2 start >/dev/null 2>&1`(默认登录是linux向导里创建的那个用户)

这里的apache的配置文件是`apache2.conf`，和centos上面的`httpd.conf`有点不同，更改网站的根目录，是在`/etc/apache2/sites-available/000-default.conf`文件中配置。

在windows主机上面，浏览器打开`localhost`或者`本机ip`即可以访问。

![](/2018-09/wsl-frp-web/showeb.png)
▲ 本地访问

## 配合frp 

网上有比较多的免费的frp服务器，同时也提供免费的域名，个人不时的用下足够了，嫌慢也可以在自己云服务器上面放一个。  
这部分就不多说了，提供frp方的配置说明都很详细...

![](/2018-09/wsl-frp-web/frpshow.png)
▲ 配合frp实现公网访问

此外可以利用`ssh`远程连接本地电脑的wsl，这间接的实现了远程管理本地电脑，因为电脑盘是挂载wsl上面的。
