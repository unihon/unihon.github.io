---
layout: post
title: [docker] networking overview
categories:
  - docker
tags:
  - network
  - translation
asciinema: false
toc: true
date: 2019-01-24 14:21:47
updated: 2019-01-24 14:21:47
---

> 【翻译】相关声名：[https://unihon.github.io/2019-01/statement-of-some-blog-articles/ ](https://unihon.github.io/2019-01/statement-of-some-blog-articles/)

<!-- more -->

> Docker v18.09  
> Configure networking  
> Overiew  
> 原文链接：[https://docs.docker.com/network/](https://docs.docker.com/network/)

# 概览

Docker容器和服务如此强大的原因之一是您可以将它们连接在一起,或者将它们连接到非Docker工作负载。Docker容器和服务甚至不需要知道它们是如何部署在Docker上，或者它们的对等端是否也是Docker工作负载。无论您的Docker主机是运行Linux，Windows还是两者兼而有之，您都可以使用Docker以与平台无关的方式管理它们。

本主题定义了一些基本的Docker网络概念，并为您准备设计和部署应用程序以充分利用这些功能。

大部分内容适用于所有Docker安装。但是，[一些高级功能](https://docs.docker.com/network/#docker-ee-networking-features)仅适用于Docker EE客户。

## 本主题的范围

本主题不涉及Docker网络如何在特定操作系统工作的详细信息，所以你找不到有关在Linux Docker如何操作`iptables`规则或者在Windows servers如何操作路由规则的信息，并且你将无法找到有关Docker如何形成并封闭数据包或者如何处理数据加密的详细信息。请参阅[Docker和iptables](https://docs.docker.com/network/iptables/)和[Docker参考架构：设计可扩展的便携式Docker容器网络](http://success.docker.com/article/networking)了解更具深度的技术细节。

另外，本主题不提供有关如何创建、管理和使用Docker网络的教程。每个章节都包含相关教程和命令参考的链接。

## 网络驱动程序

使用驱动程序，Docker的网络子系统是可插拔的（灵活的）。默认情况下已经存有几个网络驱动，并提供核心网络功能：

- `bridge`：默认的网络驱动程序。如果你不指定驱动程序，该类型的网络将会被创建。当您的应用程序在需要通信的独立容器中运行时，通常会使用桥接网络。请参阅[桥接网络](https://docs.docker.com/network/bridge/)。

- `host`：对于独立容器，删除容器和Docker主机之间的网络隔离，并直接使用主机的网络。`host`仅适用于在Docker 17.06及更高版本的swarm service。请参阅[使用host网络](https://docs.docker.com/network/host/)。

- `overlay`：Overlay网络将多个Docker守护进程连接起来，并使swarm services能够彼此通信。你还可以使用overlay网络促进swarm service和独立容器之间的通信，或者是在两个不同Docker守护进程的独立容器之间进行通信。这个策略消除了在这些容器之间执行OS级别路由的需要。请参阅[overlay网络](https://docs.docker.com/network/overlay/)。

- `macvlan`：Macvlan网络允许你给容器分配一个MAC地址，使其在你的网络上显示为物理设备。Docker守护进程通过他们的MAC地址将流量路由到容器。当处理期望直接连接到物理网络的遗留应用，使用`macvlan`网络是最好的选择，而不是通过Docker主机的网络堆栈进行路由。请参阅[Macvlan网络](https://docs.docker.com/network/macvlan/)。

- `none`：对于该容器，禁用所有的网络。通常与自定义网络驱动程序一起使用。`none`不适用于swarm services。请参阅[禁用容器网络](https://docs.docker.com/network/none/)。

- `Network plugins`：您可以使用Docker安装和使用第三方网络插件。可以从[Docker Hub](https://hub.docker.com/search?category=network&q=&type=plugin)或者是第三方供应商等到这些插件。有关安装和使用特定网络插件的信息，请参阅第三方的文件。

## 网络驱动程序小结

- 当你需要多个容器在同一个Docker主机上进行通信时，**用户自定义桥接网络**是最好的选择。
- 当网络堆栈不与Docker主机隔离，但你希望隔离容器的其他方面，**Host网络**是最好的选择。
- 当你需要在不同Docker主机上运行的容器进行通信时，或者当多个应用程序使用swarm services一起工作时，**Overlay网络**是最好的选择。
- 当你从VM设置迁移或你需要容器都具有唯一的MAC地址，使其看起来像网络上的物理主机时，**Macvlan网络**是最好的选择。
- **第三方的网络插件**允许你将Docker和专门的网络堆栈集成。

## Docker EE网络功能

以下两个功能仅支持Docker EE，并且使用Universal Control Plane (UCP)管理你的Docker服务。

- [HTTP routing mesh](https://docs.docker.com/datacenter/ucp/2.2/guides/admin/configure/use-domain-names-to-access-services/)允许您在多个服务之间共享相同的网络IP地址和端口。根据客户端的请求，UCP使用主机名和端口的组合将流量路由到适当的服务。

- [Session stickiness](https://docs.docker.com/datacenter/ucp/2.2/guides/user/services/use-domain-names-to-access-services/#sticky-sessions)允许你在HTTP头中指定信息，UCP用于将后续请求路由到同一服务任务，适用于需要有状态会话的应用程序。
