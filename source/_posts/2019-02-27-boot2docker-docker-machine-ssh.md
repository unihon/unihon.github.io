---
layout: post
title: boot2docker-docker-machine-ssh
categories:
  - docker
tags:
  - ssh
  - boot2docker
  - docker-machine
  - virtualbox
asciinema: false
date: 2019-02-27 21:20:49
updated: 2019-02-27 21:20:49
---

因为docker是基于linux上的一些特性而实现的。目前为止，如果想在非linux环境下安装docker engnie，即运行docker守护进程的主机，就得先提供一个linux环境为docker技术的实现提供低层支持。为此docker官方准备了一个为docker定制“linux发行版本”——boot2docker（下称b2d)。不管现在的docker desktop还是以前的docker toolbox，从原理上来说并没有变化，其核心都是围绕着如何让boot2docker（linux环境）更好、更便捷的在非linux主机上跑起来。

<!-- more -->

官方推荐的是将boot2docker与docker-machine还有一款虚拟化工具一起搭配使用。windows10与windows10以前的区别是，官方将其中的虚拟化工具由virtualbox，换成了windows10 Pro自带的hyper-v。

在b2d中发现的一些有趣的东西。利用docker-machine创建一个docker engine（指基于b2d的docker engine，下文同），可以发现整个过程是“全自动”的。可以知道的是docker-machine默认是通过ssh通道连接docker engine，既然是ssh，那为什么在docker engine创建完成之后就可以直接通过docker-machine提供的命令`docker-machine ssh name`或者是通过`ssh docker@ip`都可以直接的登录（无需输入任何信息）到新建的docker engine。当然ssh可以通过公、密钥的认证方式就可以实现“免密码”的登录。
其实，docker engine和docker-machine确实是通过公、密钥认证的。可以通过ssh等方式查看docker engine家目录下查看.ssh目录，里面的authorized_keys文件中的和一行公钥是和主机的公钥是一样的。

现在的疑问就是：

1. boot2docker、docker-machine是主机的公钥“发送”到docker engine的；
2. boot2docker是一个只读镜像，他又是将公钥保存在哪的。

ssh目前并没有相关的命令参数可以指定用户及登录密码，ssh、scp如果要连接远程主机会进入一个“交互模式”，用户需要手动输入密码等信息。

{% asset_img 20190227_ssh_tty.png %}
▲ ssh连接远程主机时需要手动输入信息

这样的话，如果要在脚本中实现ssh“自动登录”则需要借助一些其他的软件如expect（单单通过|管道不能给ssh填充密码）。可知的是在安装docker-machine之后，主机并没有安装expect之类的软件，当然也可能通过其他手段实现ssh的自动登录。

至于docker engine的公钥保存方式，不难知道，公钥应该是保存在docker engine的`/var/lib/boot2docker`，也就是`/mnt/sda1/var/lib/boot2docker`，实际上用户的数据都保存在这里，docker的镜像、容器之类的数据则保存在`/var/lib/docker`，即`/mnt/sda1/var/lib/docker`。

{% asset_img 20190227_b2d_dir.png %}
▲ b2d目录关系

在`/mnt/sda1/var/lib/boot2docker`下有个，`ssh`目录，实际上公钥并不在这个目录，公钥保存在`/mnt/sda1/var/lib/boot2docker`目录下的一个名为`userdata.tar`的tar包中。

{% asset_img 20190227_b2d_data.png %}
▲ b2d用户数据

通过测试，boot2docker确实是在系统启动时，将`userdata.tar`的内容解包到家目录。

现在又回到第一个问题，docker-machine、b2d，是怎样将主机的公钥打包到docker engine的`/mnt/sda1/var/lib/boot2docker/userdata.tar`。因为b2d可以自动挂载主机的共享目录，在想会不是是通过这样的方式将提前准备好的`userdata.tar`“共享到指定目录”，不过后面尝试基本需要ssh连接docker engine进行几次的命令操作，如果这样和之前就没什么区别了。

在阅读docker-machine和b2d的源码之前，我一直在思考他是怎么通过脚本进行ssh的自动登录，其实不然。

{% asset_img 20190227_b2d_source_userdata.png %}
▲ [b2d在初始化时生成userdata.tar](https://github.com/boot2docker/boot2docker/blob/master/files/init.d/autoformat#L23-L50)

{% asset_img 20190227_b2d_source_userdata_ssh.png %}
▲ [b2d在启动时将userdata.tar解包到家目录](https://github.com/boot2docker/boot2docker/blob/master/files/init.d/autoformat#L151-L158)

从源码中可以感觉`userdata.tar`是从某个设备、目录的数据导出的。不过我还是没知道他是从哪得到userdata.tar的原始数据。为此我发了个issue，请参阅[关于userdata.tar数据来源的提问](https://github.com/boot2docker/boot2docker/issues/1379)。

管理员的回答让我有点惊喜，因为我刚好在研究这一部分，关于docker-machine在生成docker engine时，处理虚拟硬盘的代码。

{% asset_img 20190227_dm_source_userdata.png %}
▲ [docker machine在将主机的公钥打开成tar，生成数据流](https://github.com/docker/machine/blob/61ef47dc5d6b1658e3d6636f9382d50507c8c7e1/libmachine/mcnutils/b2d.go#L485-L542)

{% asset_img 20190227_dm_source_vm.png %}
▲ [docker machine通过VboxManage生成虚拟硬盘及相关处理](https://github.com/docker/machine/blob/61ef47dc5d6b1658e3d6636f9382d50507c8c7e1/libmachine/mcnutils/b2d.go#L485-L542)

这部分代码前后有点多，在大概有2、3个关联文件，其中的主要思想如下：

1. 将主机的公钥打包，生成数据流；
2. 打开相关的“管道”，通过VboxManage的`convertfromraw stdin`命令创建虚拟硬盘；
3. 通过“管道”将先前打包的公钥数据流写入虚拟硬盘；
4. 处理虚拟硬盘头信息，写入魔法标记“boot2docker, please format-me”等。

这样，docker-machine就将主机的公钥写入了虚拟硬盘。前面的关于“boot2docker在哪得到userdata的源数据”疑问也解释了。

最后描述下docker engine初始化时处理“公钥”的过程：

1. 第一次启动时，脚本会扫描系统挂载的硬盘，并逐一的扫描硬盘头的信息，以寻找魔法标记“boot2docker, please format-me”；
2. 如果没能找到魔法标记则，跳过生成`userdata.tar`，如果找到了魔法标记，便从硬盘特定位置通过`dd`将里面的userdata数据导出到本地的`userdata.tar`；
3. 如果`userdata.tar`存在，则将其解压到家目录。

这样，就解释了在创建好docker enginer后，为什么可以直接的ssh进入docker enginer。
