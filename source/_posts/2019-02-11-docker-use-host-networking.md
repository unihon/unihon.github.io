---
layout: post
title: "[docker] use host networking"
categories:
  - docker
tags:
  - network
  - translation
asciinema: false
toc: true
date: 2019-02-11 21:37:14
updated: 2019-02-11 21:37:14
---

> 【翻译】相关声名：[https://unihon.github.io/2019-01/statement-of-some-blog-articles/ ](https://unihon.github.io/2019-01/statement-of-some-blog-articles/)

<!-- more -->

> Docker v18.09  
> Configure networking  
> Use host networking  
> 原文链接：[https://docs.docker.com/network/host/](https://docs.docker.com/network/host/)

# 使用host网络

如果你对容器使用host网络驱动程序，则该容器的网络堆栈不会与Docker主机隔离。例如，如果你运行绑定到83端口的容器并使用host网络，则容器的应用程序将在主机IP地址的80端口上可用。

host网络驱动程序只能工作在Linux主机上，Docker Desktop for Mac和Docker Desktop for Windows或者Docker EE for Windows Server并不支持。

在Docker 17.06及更高版本中，你也可以将`--network host`加到`docker container create`命令，为swarm service使用`host`网络。在这种情况下，控制流量（与管理swarm和service相关的流量）仍然通过overlay网络发送，但是各个swarm服务容器使用Docker守护程序的主机网络和端口发送数据。这会产生一些额外的限制。例如，如果服务容器绑定到80端口，则只有一个服务容器可以在给定的swarm节点上运行。

如果你的容器或服务未发布端口，则主机网络无效。
