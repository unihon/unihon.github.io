---
layout: post
title: "[docker] disable networking for a container"
categories:
  - docker
tags:
  - network
  - translation
asciinema: false
toc: true
date: 2019-02-11 21:38:04
updated: 2019-02-11 21:38:04
---

> 【翻译】相关声名：[https://unihon.github.io/2019-01/statement-of-some-blog-articles/ ](https://unihon.github.io/2019-01/statement-of-some-blog-articles/)

<!-- more -->
> Docker v18.09  
> Configure networking  
> Disable networking for a container
> 原文链接：[https://docs.docker.com/network/none/](https://docs.docker.com/network/none/)

# 禁用容器的网络连接

如果你想要完全禁用容器上的网络堆栈，可以在启动容器时使用`--network none`参数。在容器内仅创建环回设备。以下示例说明了这一点。

1. 创建容器。

``` bash
$ docker run --rm -dit \
  --network none \
  --name no-net-alpine \
  alpine:latest \
  ash
```

2. 通过在容器中执行一些常见的网络命令来检查容器的网络堆栈。请注意，没有创建`eth0`。

``` bash
$ docker exec no-net-alpine ip link show

1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: tunl0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN qlen 1
    link/ipip 0.0.0.0 brd 0.0.0.0
3: ip6tnl0@NONE: <NOARP> mtu 1452 qdisc noop state DOWN qlen 1
    link/tunnel6 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00 brd 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
```

``` bash
$ docker exec no-net-alpine ip route
```

第二条命令返回空，因为没有路由表。

3. 停止容器。它会被自动删除，因为它在创建时使用了`--rm`参数。

``` bash
$ docker container rm no-net-alpine
```
