---
layout: post
title: docker use bridge networks
categories:
  - docker
tags:
  - network
  - translation
asciinema: false
toc: true
date: 2019-01-24 15:04:19
updated: 2019-01-24 15:04:19
---

> 翻译  
> 相关声名：[https://unihon.github.io/2019-01/statement-of-some-blog-articles/ ](https://unihon.github.io/2019-01/statement-of-some-blog-articles/)

<!-- more -->

> Docker v18.09  
> Configure networking  
> Use bridge networks  
> 原文链接：[https://docs.docker.com/network/bridge/](https://docs.docker.com/network/bridge/)

# 使用桥接网络

在网络方面，桥接网络是一个网段之内转发流量的链路层设备。网桥可以是一个硬件设备或者是一个运行在主机核心内的软件设备。  
在Docker方面，桥接网络使用软件网桥，允许容器连接到同一个网桥网格进行通信。当容器需要提供隔离时便不需要连接到这个网桥。Docker的网桥驱动自动将相关的规则、配置安装在主机，这样容器在不同的桥接网络不允许彼此直接通信。

桥接网络适用于在同一个Docker守护程序主机上运行的容器。对于在不同Docker守护程序主机上运行的容器之间的通信，您可以在操作系统级别管理路由，也可以使用overlay网络。

当你启动Docker，默认桥接网络（也称作网桥）将会被自动创建，除非另有规定，否则新启动的容器将连接到此网桥。你也可以创建用户自定义的桥接网络。用户自定义的桥接网络更优于默认网桥（生产环境中更适用）。

## 用户自定义网桥和默认网桥的差异

- 用户自定义的网桥可在容器应用之间提供更好的隔离和互操作性。

    连接到同一用户定义的网桥的容器会自动将所有端口相互暴露，并且不会向外界开放任何端口。这使得容器化应用程序可以轻松地相互通信，而不会意外地打开对外界的访问。

    想象一个具有Web前端和数据库后端的应用程序。外部环境需要访问Web前端（可能通过80端口），但只有后端自身需要访问数据库主机和端口。使用用户自定义的网桥，只有Web端口需要被开放，同时数据库应用不需要开放任何的端口，因为Web前端可以通过用户自定义的网格访问到它。

    如果在默认桥接网络上运行相同的应用程序堆栈，需要同时都开放Web端口和数据库的端口，为每个应用使用 `-p`或者`--publish`参数。这意味着Docker主机需要通过其他手段阻止对数据库的端口的访问。

- 用户自定义网桥为容器之间提供的自动DNS解析

    在默认桥接网络，容器仅能通过IP地址相互访问，除非你使用`--link`参数，这是一个遗留的参数。在用户自定义桥接网络，容器可以通过名字或者别名相互解析。

    想象有一个与上面所提同样的应用，有一个Web前端和一个数据库后台。假设称这两个容器为web和db，无论在哪个Docker主机上面运行应用程序堆栈，web容器都可以访问到db容器。

    如果是在默认桥接网络运行同样的应用程序堆栈，需要在容器之间手动创建链路（使用`--link`参数），每个容器都需要创建这些链路。正如你所见，如果超出两个容器需要相互通信，这将变得复杂起来。另外，你可以操作容器内的`/etc/hosts`文件，但这创建的问题是难于调试（debug）。

- 容器在运行时可以与用户自定义网络附加和分离。

    在容器的生命周期，你可以从用户自定义的网络将运行中的容器连接或者断开。从默认桥接网络中删除容器，你需要停止容器并使用不同的网络参数重新创建（启动）它。

- 每个用户自定义网络可以创建一个可配置网桥。

    如果你的容器使用默认桥接网络，你可以配置它，但是所有所用默认桥接网络的容器都将会使用同样的设置，比如MTU和`iptables`的规则。另外，配置默认桥接网络是发生在Docker自身之外，要使修改后的配置生效需要将Docker重启。

    用户自定义桥接网络使用`docker network create`创建和配置。如果应用的不同组有不同的网络需求，当你创建网桥时，可以分别为每一个用户自定义网桥进行配置。

- 默认桥接网络上的链接容器共享环境变量。

    本来，在两个容器之间共享环境变量的唯一方法是使用`--link`参数。用户自定义网络不支持这种共享环境变量的方法。然而，这里有更好的方法共享环境变量。一些思路：

  - 使用Docker volume，多个容器可以挂载包含共享信息的文件或者目录。
  - 可以使用`docker-compose`启动多个容器，compose file可以定义共享变量。
  - 你可以使用swarm services代替单一的容器，并利用其共享secret和configs的优点。

容器连接到同样的用户自定义桥接网络，可以有效的将所有端口相互开放。要使端口可以在不同网络上的容器或非Docker主机可以访问，必须使用`-p`或`--publish`参数发布该端口。

## 管理用户自定义网桥

使用`docker network create`命令创建用户自定义桥接网络。

``` bash
$ docker network create my-net
```

你可以指定子网，IP地址范围，网关和其他参数。请参阅[docker network create](https://docs.docker.com/engine/reference/commandline/network_create/#specify-advanced-options)或者输出`docker network create --help`获取详细信息。

使用`docker network rm`命令删除用户自定义桥接网络。如果容器目前已连接此网络，请先断开它们。

``` bash
$ docker network rm my-net
```

> **实际会发生什么?**  
当你创建或者删除一个用户自定义网桥，或者容器从一个用户自定义网桥连接或者断开连接，Docker使用特定工具管理操作系统的底层网络基础设施（比如在Linux上面增加、删除网桥设备或配置`iptables`规则）。这些细节应视为实施细节。让Docker为你管理用户自定义网桥。

## 将容器连接到用户自定义网桥

当你创建一个新容器，你可以指定一个或者多个`--network`参数。这个例子将Nginx容器连接到`my-net`网络。还将容器中的80端口发布到Docker主机的8080端口上。所以外部客户端可以访问到该端口（容器的80端口）。连接到`my-net`网络的任何其他容器都可以访问`my-nginx`容器上的所有端口，反之亦然。

``` bash
$ docker create --name my-nginx \
  --network my-net \
  --publish 8080:80 \
  nginx:latest
```

将一个运行中的容器连接到一个现有的用户自定义网桥，使用`docker network connect`命令。以下的命令将已经在运行的`my-nginx`容器连接到已经存在的`my-net`网络。

``` bash
$ docker network connect my-net my-nginx
```

## 将容器与用户自定义网桥断开连接

将正在运行的容器与用户自定义网桥断开连接，使用`docker network disconnect`命令。以下命令将`my-ngix`容器与`my-net`断开连接。

``` bash
$ docker network disconnect my-net my-nginx
```

## 使用IPv6

如果你需要Docker容器对IPv6的支持，在创建IPv6网络或者分配IPv6地址之前，你需要在Docker守护进程上[启用该参数](https://docs.docker.com/config/daemon/ipv6/)，并重新加载其配置。

当你创建你的网络，你可以指定`--ipv6`参数开启IPv6。你不能在默认桥接网络上选择关闭IPv6的支持。

## 开启从Docker容器转发到外界

默认情况下，由容器连接到默认桥接网络的流量不允许转发到外界。启用这流量转发，你需要改变两个设置。这些不是Docker命令，并且他们会影响Docker主机的内核。

1. 配置Linux内核以允许IP转发。

    ``` bash
    $ sysctl net.ipv4.conf.all.forwarding=1
    ```

2. 改变`iptables` `FORWARD`策略由`DROP`为`ACCEPT`。

    ``` bash
    $ sudo iptables -P FORWARD ACCEPT
    ```

这些设置在重启后将会失效，所以你可能需要将它们添加到启动脚本中。

## 使用默认桥接网络

默认`桥接`网络被认为是Docker的遗留功能，并且不推荐在生产环境中使用它。配置它需要手动操作，另外它有技术缺点。

## 将容器连接到默认桥接网桥

如果你不使用`--network`参数指定一个网络，并且指定了网络驱动程序，默认情况下，你的容器将连接到默认桥接网络。容器连接到默认桥接网络仅能通过IP地址进行通信，除非使用[遗留的`--link`参数](https://docs.docker.com/network/links/)链接它们。

## 配置默认桥接网络

配置默认桥接网络，你需要在`daemon.json`中指定参数。这是一个有几个参数的`daemon.json`的例子。仅指定你需要自定义的配置。

``` json
{
  "bip": "192.168.1.5/24",
  "fixed-cidr": "192.168.1.5/25",
  "fixed-cidr-v6": "2001:db8::/64",
  "mtu": 1500,
  "default-gateway": "10.20.1.1",
  "default-gateway-v6": "2001:db8:abcd::89",
  "dns": ["10.20.1.2","10.20.1.3"]
}
```

重启Docker以使更改生效。

## 在默认桥接网络使用IPv6

如果配置Docker以支持IPv6（请参阅[使用IPv6](https://docs.docker.com/network/bridge/#use-ipv6)）,默认桥接网络已经自动配置IPv6。与用户自定义网桥不同，你不能在默认网桥选择关闭IPv6。
