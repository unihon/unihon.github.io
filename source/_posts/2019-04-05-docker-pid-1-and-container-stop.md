---
layout: post
title: docker-pid-1-and-container-stop
categories:
  - docker
tags:
  - PID-1
  - process
asciinema: false
toc: true
date: 2019-04-05 12:13:53
updated: 2019-04-05 12:13:53
---

关于docker中容器的PID 1和容器停止过程的思考。

<!-- more -->

## PID 1

容器的“入口进程”必须要保持前台运行，如果进程在后台运行（或进程结束），容器也会随之退出、停止。

可以这样理解，当启动一个容器时，便有一个“入口进程”即PID 1在容器中运行，“入口进程”在执行程序时可以产生其他子进程，不过，如果是通过&或者其他途径在将子程序以后台的形式运行，那么“入口进程”将将继续顺序执行，如果中间没其他子程序堵塞，将一直执行到结束。当“入口进程”结束时，不管还有没有其他子进程在运行，都会退出容器，容器便停止了。

## docker stop

在`dockerfile`的`ENTRYPOING`章节中有个比较有意思的地方。

> The shell form prevents any CMD or run command line arguments from being used, but has the disadvantage that your ENTRYPOINT will be started as a subcommand of /bin/sh -c, which does not pass signals. This means that the executable will not be the container’s PID 1 - and will not receive Unix signals - so your executable will not receive a SIGTERM from docker stop <container>.

同时还有两个对比例子。

注：留意容器内PID 1进程是什么

{% asset_img 20190405_use_exec.png %}
▲ 使用exec，容器可以快速的停止

{% asset_img 20190405_no_exec.png %}
▲ 不使用exec，容器的停止的时间明显长很多

关于`docker stop`命令的解释是这样的：

> The main process inside the container will receive SIGTERM, and after a grace period, SIGKILL.

`docker stop`命令首先是给容器内部进程发送`SIGTERM`信号，超出宽限期（默认10s）即超时后便发送`SIGKILL`信号。

其实结合上面官方的解释中可以分析出，`docker stop`发送的信号实际上作用的对象是容器中的PID 1，即只有容器中的PID 1进程可以接收到`docker stop`发送的stop信号。

上面的没有使用`exec`的例子中，容器停止之所以花这么长时间，是因为容器没能正常停止（PID 1进程在收到stop信号后没结束），在超时（默认10s）后才被强制停止。

下面进入正题。

不管有没有使用`exec`，容器运行时都有PID 1进程（肯定、也必须有），既然stop信号的作用象是PID 1，那为什么，有的却会正常停止失败。

其实，虽然运行的容器中都有PID 1的程序进程，但不同的程序对信号的处理方式不一定相同。

{% asset_img 20190405_pid_1_top.png %}
▲ PID 1的top程序

{% asset_img 20190405_pid_1_sh.png %}
▲ PID 1的sh程序

这里我针对top和sh两个程序对`docker stop`的信号的处理方式进行测试，以一个alpine镜像分别运行两个容器。

``` bash
# 下面为主要命令，并不是同时执行
$ docker run --rm --name top_p -it alpine top
$ docker run --rm --name sh_p -it alpine sh 
```

### 对top程序进行测试

{% asset_img 20190405_do_top.png %}
▲ 启动top程序的单一进程容器：top_p

{% asset_img 20190405_do_top_stop.png %}
▲ 停止top程序的单一进程容器：top_p

容器的停止用时是0.209s，和默认的超时10s期限还差很远，得出的结果是容器可以正常停止。

### 对sh程序进行测试

{% asset_img 20190405_do_sh.png %}
▲ 启动sh程序的单一进程容器：sh_p

注：忽略ps

{% asset_img 20190405_do_sh_stop.png %}
▲ 停止sh程序的单一进程容器：sh_p

容器的停止用时是10.252s，结果很明显，这个是超时的，容器不可以正常停止。

到这里，我对sh程序进行更深入的测试，以证明，是因为PID 1的sh程序的进程在接收到`docker stop`的信号后没做“结束进程”的处理而导致容器不可以正常停止。

`trap`可以监视并拦截的Linux信号，这里我使用`trap`来拦截`docker stop`的信号，并在拦截到信号后结束进程（PID 1进程）。

{% asset_img 20190405_trap_sh.png %}
▲ 启动sh程序的单一进程容器，并使用`trap`拦截信号：sh_p

{% asset_img 20190405_trap_sh_stop.png %}
▲ 停止sh程序的单一进程容器：sh_p

注：实际上在trap拦截到信号后，要按一下回车才执行信号处理，没找到原因，不过不影响测试目的

容器的停止用时是1.227s！没有超时（10s），容器正常的停止了。

### 测试结论

通过对top和sh两个程序对`docker stop`的信号的处理方式的测试结果可以得出的结论是，容器是否能正常停止，和容器中PID 1的程序进程对`docker stop`的信号处理方式有关。

## 小结

容器是否正在运行的判定标准是容器内的PID 1是否存活。

能不能优雅停止容器的关键是PID 1在收到stop信号后，PID1自己作不作出结束进程的反应，与PID 1进程有没有子进程无关，如果，PID 1在收到stop信息后能结束自身进程，则可以优雅停止。
