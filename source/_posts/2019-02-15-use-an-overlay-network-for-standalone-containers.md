---
layout: post
title: use an overlay network for standalone containers
categories:
  - docker
tags:
  - network
  - communicate
asciinema: false
date: 2019-02-15 15:00:19
updated: 2019-02-15 15:00:19
---

因为overlay网络必须要初始化一个swarm，所以需要开放以下端口：

- 用于集群管理通信的TCP 2377端口
- 用于节点之间通信的TCP、UDP 7946端口
- 用于overlay网络流量传输的UDP 4789端口

使用overlay网络让在不同的Docker主机上运行的容器能够通信。

<!-- more -->

选择一个manager主机，并使用`docker swarm init`命令初始化一个swarm，如果主机上有多个网络接口，需要在刚刚的命令上加上`--advertise-addr=<IP-ADDRESS-OF-MANAGER>`参数来指定使用的接口地址（在初始化swarm后会返回一个TOKEN，需要记录下来）。其他主机则使用如下命令连接刚刚初始化的swarm。

``` bash
$ docker swarm join --token <TOKEN> \
  --advertise-addr <IP-ADDRESS-OF-WORKER-1> \
  <IP-ADDRESS-OF-MANAGER>:2377
```

查看swarm节点的相关信息。

{% asset_img 20190215_swarm_node.png %}
▲ 查看各个节点状态

{% asset_img 20190215_swarm_node_network.png %}
▲ 查看各个节点的docker网络

后面的操作只需要两个docker主机演示，manager主机——Hon_Docker和另一个节点主机——Hon_Docker_0。

首先在manager主机上创建一个自定义的overlay网络`test-net`，并启动一个容器`alpine1`。（注意只需要在manager主机上创建`test-net`，其他节点主机如果需要`test-net`则会自动创建）。

{% asset_img 20190215_swarm_node_network_0.png %}
▲ 在manager上创建网络及其他操作

从图中，可以看到，在manager主机创建`test-net`后，Hon_Docker_0并没有在本地“同步创建”`test-net`。然后在Hon_Docker_0启动一个容器`alpine2`并指定使用`test-net`网络。再次查看Hon_Docker_0的docker网络信息，这时`test-net`已经自动创建。

接着切换到manager主机上的`alpine1`，并ping Hon_Docker_0主机上`alpine2`，同样的从`alpine2` ping `alpine1`，从测试结果中可以看到是互通的（这种直接通过容器名解析到容器IP的能力，之前在**使用用户自定义桥接网络**的章节中有看到解释：*resolve a container name to an IP address. This capability is called automatic service discovery.*，两个原理应该一样）。

{% asset_img 20190215_node_communicate.png %}
▲ 运行在不同主机上的容器通信测试

相对于manager主机，节点主机如果不再有容器使用`test-net`，节点主机便会在本地自动删除`test-net`（manager主机上的`test-net`需要手动删除）。

{% asset_img 20190215_swarm_node_end.png %}
▲ `alpine2`退出后，Hon_Docker_0主机自动删除`test-net`

## 参考

- <https://docs.docker.com/network/network-tutorial-overlay/>
