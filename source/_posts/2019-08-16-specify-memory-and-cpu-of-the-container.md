---
layout: post
title: specify-memory-and-cpu-of-the-container
categories:
  - Docker
tags:
  - Resource
  - CPU
  - Memory
asciinema: false
date: 2019-08-16 15:23:03
updated: 2019-08-16 15:23:03
---

限制 Docker 容器所使用的 Memory、CPU 资源。

<!-- more -->

## Memory

Memory 的控制主要涉及的选项为 `memory` 和 `memory-swap`。这两个选项的不同组合有着不同的含义。

> 注：如不特别说明，`memory` 和 `memory-swap` 均指正整数；[ a \ b ] 表示同时设置 a 和 b。

### [ `memory` \ `memory-swap`，`memory` != `memory-swap` ]

`memory-swap` = `memory` + `swap`  
`swap `= `memory-swap` -` memory`

### [ `memory` \ `memory-swap`，`memory` == `memory-swap` ]

容器将不能使用 `swap`，即 `swap` = 0。

### [ `memory` ]

`swap` = `memory` * 2

### [ `memory-swap` == 0 ]

`memory-swap` 的设置将被忽略，相当是没有设置 `memory-swap`。

### [ `memory-swap` == -1 ]  
容器的 `swap` 和宿主机的 `swap` 大小一样。

### 注意

不能直接在容器内部执行相关的查看命令（如 `free`）查看容器内存的“限制”信息，这类命令（如 `free`）在容器中得到数据是和宿主机上的数据是一样的。  
可以使用 `docker stats container` 或者 `docker inspect ` 查看容器的资源“限制”信息。


## CPU

CPU 的控制（数量）主要涉及的选项为 `cpu-period` 和 `cpu-quota`，如果是 Docker 1.13 及以上，可以用更方便的 `cpus` 取代。

> 注意：这里的 CPU 数量，指的是逻辑 CPU 数量。

>`cpu-period`：The length of a CPU period in microseconds.  
`cpu-quota`： Microseconds of CPU time that the container can get in a CPU period.

`cpu-period` 的默认值为 `100` 毫秒（`cpu-period` 给的是 `100000`，应该是换算为微秒了），没什么特别需求不用更改。

实际 CPU 的使用量为 `cpu-quota/cpu-period`，`cpu-quota` 使用默认值 `100000`。  

如果限制为一个 CPU 的 50%（半个 CPU），`cpu-quota` 则为 `50000`。

```
# 更多例子
cpu-period = 100000
cpu-quota = 100000
1 个 CPU。

cpu-period = 100000
cpu-quota = 150000
1.5 个 CPU。

cpu-period = 100000
cpu-quota = 200000
2 CPU。
```

### 注意
 
如果是使用 `cpus` 限制容器的 CPU 数量，当指定的数量大于宿主机的 CPU 数量时，会返回不能指定大于宿主机的 CPU 数量的提示。  
而用 `cpu-quota` 和 `cpu-period` 时，当他们的比值大于宿主机的 CPU 数量时，是不会报错的。因为 `cpu-quota` 指定的是“上限配额”，如果 `cpu-quota/cpu-period` 大于宿主机的 CPU 数量时，则是表示可以使用所有的 CPU 资源。

> 注：关于 cpu-period 和 cpu-quota 更详细的信息，请看参考。

## 参考

- <https://docs.docker.com/config/containers/resource_constraints/>
- <https://www.kernel.org/doc/Documentation/scheduler/sched-bwc.txt>