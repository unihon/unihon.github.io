---
layout: post
title: docker-use-overlay-networks
categories:
  - docker
tags:
  - network
  - translation
asciinema: false
toc: true
date: 2019-02-10 20:23:05
updated: 2019-02-10 20:23:05
---

> 【翻译】相关声名：[https://unihon.github.io/2019-01/statement-of-some-blog-articles/ ](https://unihon.github.io/2019-01/statement-of-some-blog-articles/)

<!-- more -->

> Docker v18.09  
> Configure networking  
> Use overlay networks  
> 原文链接：[https://docs.docker.com/network/overlay/](https://docs.docker.com/network/overlay/)

# 使用overlay网络

`overlay`网络驱动程序在多个Docker守护程序主机之间创建分布式网络。该网络位于（overlays）特定于主机的网络之上，允许连接到它的容器（包括swarm service）安全地通信。Docker透明地处理每个数据包与正确的Docker守护程序主机和正确的目标容器的路由。

当你初始化一个swarm或者使一个Docker主机加入一个已经存在的swarm，将会在Docker主机新建两个网络。

- 一个称作`ingress`的overlay网络，用于处理与swarm services相关的控制和数据流量。当你创建一个swarm service并且不将其连到到一个用户自定义的overlay网络时，默认情况下它会连接到`ingress`网络。
- 一个是称作`docker_gwbridge`的桥接网络，用于将各个Docker守护进程连接到加入swarm的其他守护进程。

你可以使用`docker network create`命令创建用户自定义的`overlay`网络，利用同样的方法你可以创建用户自定义的`bridge`网络。服务或容器可以一次连接超过一个网络。服务或容器只能通过它们各自连接的网络进行通信。

虽然你可以将swarm services和独立容器连接到覆盖网络，但默认特性（表现、行为）和配置问题是不同的。因此，本主题的其余部分分为适用于所有overlay网络的操作，适用于swarm service网络的操作以及适用于独立容器使用的覆盖网络的操作。

## 所有overlay网络的操作

### 创建一个overlay网络

> **先决条件：**
- Docker守护进程的防火墙规则使用overlay网络
  在overlay网络上，使每个参加overlay网络的Docker主机能够相互通信，你需要开放以下端口。
  * 用于集群管理通信的TCP 2377端口
  * 用于节点之间通信的TCP、UDP 7946端口
  * 用于overlay网络流量传输的UDP 4789端口
- 在创建overlay网络之前，你需要使用`docker swarm init`初始化你的Docker守护进程为一个swarm manager，或者使用`docker swarm join`将Docker守护进程连接到一个现有的swarm。这些中的任何一个都会创建默认的`ingress` overlay网络，默认情况下由swarm service使用。即使你从未计划使用swarm services，也需要执行此操作。之后，你可以另外创建用户自定义的overlay网络。

要创建于swarm services的overlay网络，使用如下命令：

``` bash
$ docker network create -d overlay my-overlay
```

要创建可由swarm services或独立容器用于与在其他Docker守护程序上运行的其他独立容器通信的overlay网络，请添加`--attachable`参数：

``` bash
$ docker network create -d overlay --attachable my-attachable-overlay
```

你可以指定IP地址范围、子网、网关和其他选项。有关详细信息，请参阅`docker network create --help`。

### 加密overlay网络上的流量

默认情况下，所有swarm service管理流量都已加密，在GCM模式下使用[AES算法](https://en.wikipedia.org/wiki/Galois/Counter_Mode)。swarm中的管理者节点每隔12小时轮换用于加密gossip data的密钥。

要加密应用程序数据，请在创建overlay网络时添加`--opt encrypted`。这样可以在vxlan级别启用IPSEC加密。此加密会带来不可忽视的性能损失，因此你应该在生产中使用此选项之前对其进行测试。

当你启用overlay加密时，Docker会在所有节点之间创建IPSEC隧道，在这些节点上为连接到overlay网络的服务安排任务。这些隧道也是在GCM模式下使用AES算法，管理者节点每12小时自动轮换密钥。

> **不要将Windows节点连接到加密的overlay网络。**
>
>Overlay网络在Windows上不支持加密。如果Windows节点尝试连接到加密的overlay网络，则不会检测到错误，但节点无法通信。

### swarm模式overlay网络和独立容器

你可以将overlay网络功能与`--opt encrypted --attachable`一起使用，并且附加非托管容器到该网络：

``` bash
$ docker network create --opt encrypted --driver overlay --attachable my-attachable-multi-host-network
```

### 自定义默认的ingress网络

大多数用户从不需要配置`ingress`网络，但Docker 17.05及更高版本允许你这样做。如果自动选择的子网与网络上已存在的子网冲突，或者你需要自定义其他低层网络设置（如MTU），则此功能非常有用。

自定义`ingress`网络涉及删除和重新创建它。这通常是你在swarm中创建任何服务之前完成。如果你具有发布端口的现有服务，则需要先删除这些服务，然后才能删除`ingress`网络。

在不存在`ingress`网络的期间，现有的服务不发布端口继续运行，但不是负载平衡的。这会影响发布端口的服务，例如发布80端口的WordPress服务。

1. 使用`docker network inspect ingress`检查`ingress`网络，并且删除所有连接到其的服务。这些是发布端口的服务，例如发布80端口的WordPress服务。如果所有这些服务都没有停止，那么下一步会失败。

2. 删除现有的`ingress`网络：

``` bash
$ docker network rm ingress

WARNING! Before removing the routing-mesh network, make sure all the nodes
in your swarm run the same docker engine version. Otherwise, removal may not
be effective and functionality of newly created ingress networks will be
impaired.
Are you sure you want to continue? [y/N]
```

3. 使用`--ingress`参数创建一个新的overlay网络，以及要设置的自定义选项。此示例将MTU设置为1200，将子网设置为`10.11.0.0/16`，并将网关设置为`10.11.0.2`。

``` bash
$ docker network create \
  --driver overlay \
  --ingress \
  --subnet=10.11.0.0/16 \
  --gateway=10.11.0.2 \
  --opt com.docker.network.driver.mtu=1200 \
  my-ingress
  ```

> **注意：** 你可以命名你的`ingress`网络除（名为）`ingress`之外，你只能拥有一个`ingress`网络。尝试创建第二个会失败。

4. 重新启动你在第一步中停止的服务。

### 自定义docker_gwbridge接口

`docker_gwbridge`是一个将overlay网络（包括`ingress`网络）连接到个人Docker守护进程的物理网络的虚拟网桥。Docker会在你初始化一个swarm或者在连接一个Docker主机到swarm的时候自动地它，但它不是一个Docker设备。它存在于Docker主机的内核中。如果你需要自定义其设置，你必须在Docker主机加入swarm之前或者暂时从swarm删除主机之后执行此操作。

1. 停止Docker。
2. 删除现存的`docker_gwbridge`接口

``` bash
$ sudo ip link set docker_gwbridge down
$ sudo ip link del dev docker_gwbridge
```

3. 启动Docker。不要连接（加入）或者初始化swarm。
4. 使用`docker network create`命令根据你的自定义设置手动创建或者重建`docker_gwbridge`网桥。这个例子使用`10.11.0.0/16`子网。有关可自定义选项的完整列表，请参阅[Bridge driver options](https://docs.docker.com/engine/reference/commandline/network_create/#bridge-driver-options)。

``` bash
$ docker network create \
--subnet 10.11.0.0/16 \
--opt com.docker.network.bridge.name=docker_gwbridge \
--opt com.docker.network.bridge.enable_icc=false \
--opt com.docker.network.bridge.enable_ip_masquerade=true \
docker_gwbridge
```

5. 初始化或者连接（加入）swarm，由于桥已经存在，Docker不会使用自动设置创建它。

## swarm services的操作

### 在overlay网络发布端口

Swarm services连接到同样的overlay网络会有效地将所有端口相互暴露。对于可在服务外部访问的端口，这个端口必须在`docker service create`或者`docker service update`中使用`-p`或者`--publish`参数。支持“遗留”的冒号分隔的语法和较新的逗号分隔值语法。较长的语法是首选，因为它有点自我文档化（what?）。

| 参数 | 描述 | 
| - | - | 
| -p 8080:80 or -p published=8080,target=80 | 将服务上的TCP 80端口映射到routing mesh上的8080端口。 |
| -p 8080:80/udp or -p published=8080,target=80,protocol=udp | 将服务上的UDP 80端口映射到routing mesh上的8080端口。 |
| -p 8080:80/tcp -p 8080:80/udp or -p published=8080,target=80,protocol=tcp -p published=8080,target=80,protocol=udp | 将服务上的TCP 80端口映射到routing mesh上的TCP 8080端口，并将服务上的UDP 80端口映射到routing mesh上的UDP 8080端口。 |

### 绕过swarm service的routing mesh 

默认情况下，发布端口的swarm services使用路由网格来实现。当你连接到任何swarm节点上已经发布的端口（无论它是否正在运行给定服务）时，你将被透明地重定向到正在运行该服务的工作线程。实际上，Docker充当你的swarm services的负载均衡器。使用routing mesh的服务以virtual IP（VIP）模式运行。甚至在每个节点上运行的服务（通过--mode全局标志）也使用routing mesh。当使用routing mesh，无法保证哪个Docker节点服务客户端请求。

要绕过routing mesh，可以使用DNS循环（DNSRR）模式，通过设置`--endpoint-mode`参数为`dnsrr`启动服务。你必须在服务之前运行你自己的负载均衡器。Docker主机上的服务名称的DNS查询返回运行该服务的节点的IP地址列表。配置负载均衡器以使用此列表并平衡节点之间的流量。

### 分离控制和数据流量

默认情况下，尽管群集控制流量已加密，但控制与swarm管理相关的流量以及流入和流出应用程序的流量都在同一网络上运行。你可以配置Docker使用独立的网络接口去处理这两种不同类型的流量。当你初始化或者连接（加入）swarm时，分别指定`--advertise-addr`和`--datapath-addr`。你必须为每个连接swarm的节点执行此操作。

## swarm网络上独立容器的操作

### 将独立容器连接到swarm网络

`ingress`网络在创建时不使用`--attachable`参数，意味着只有swarm services可以使用它，而不是独立容器。你可以将独立容器连接到创建时使用`--attachable`参数的用户自定义的overlay网络。这使得在不同Docker守护程序上运行的独立容器能够进行通信，而无需在各个Docker守护程序主机上设置路由。

### 发布端口

| 参数 | 描述 | 
| - | - | 
| -p 8080:80 | 将容器上的TCP 80端口映射到overlay网络上的8080端口。 |
| -p 8080:80/udp | 将容器上的UDP 80端口映射到overlay网络上的8080端口。 |
| -p 8080:80/sctp | 将容器上的STCP 80端口映射到overlay网络上的STCP 8080端口 |
| -p 8080:80/tcp -p 8080:80/udp | 将容器上的TCP 80端口映射到overlay网络上的TCP 8080端口，并将容器上的UDP 80端口映射到overlay网络上的UDP 8080端口。 |

### 容器发现

对于大多数情况，你应该连接到服务名称，该名称是负载平衡的，并由支持该服务的所有容器（“tasks”）处理。要获取支持该服务的所有任务的列表，请执行DNS查找`tasks.<service-name>`。
