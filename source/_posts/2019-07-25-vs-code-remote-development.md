---
layout: post
title: vs-code-remote-development
categories:
  - Development
tags:
  - VSCode
  - Vim
  - Linux
asciinema: false
date: 2019-07-25 22:55:40
updated: 2019-07-25 22:55:40
---

使用 VS Code 的远程开发功能。

<!-- more -->

之前 VS Code 的远程功能其实很弱，在这个“强化”后的功能正式推出时，就立即尝试了下，不过直到最近才算正式的在自己的日常开发中使用起来

对于大多数的程度开发、服务软件通常在 Linux 上面都有有更好的支持（不包括 Windows、MacOS 之类平台的程序等）。所以个人的开发环境基本是在 Linux 上面的。

此前、包括现在，我用最多的的编辑器是 Vim ，其次是 VS Code。VS Code 的功能基本上都能在 Vim 找到相应的插件。不过 Vim 对于一些自动补全、代码跟踪等复杂一点的插件，其安装通常比较繁琐的，也很可能为了打开某个支持，需要重新编译 vim。我的使用软件的“原则”是尽可能的做到简易、且易于迁移。

所以，上面说的那类 Vim 的插件我基本是不使用的。

对于一些“规模”点的项目，就会感觉到 Vim 的短板了（如果你愿意，基本都能强化）。在此情况下，我选择了更为现代化、且易于配置的的编辑器 VS Code。

## VS Code 的远程开发配置

VS Code 的远程开发支持三个模式，WSL、SSH（远程主机）、Containers（Docker 容器）。

### 软件安装

1. 首先是需要在 Windows 上安装 OpenSSH 程序（略过）
2. 下载 VS Code 的远程开发插件 [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpackRemote Development)

> 这个插件是个插件组，包含了上面三个模式及其他功能所需要的插件，原理上说可以只下自己需要的那几个

<!-- <img id="sm" src="/2018-09/wsl-frp-web/set.png"> -->

<img id="sm" src="/2019-07/vs-code-remote-development/2019-07-25-remote-dev.jpg">
▲ Remote Development 插件组

## VS Code 远程主机配置

配置文件中的 Host 为远程主机名，在 VS Code 中起的是标识主机的作用。

{% asset_img 2019-07-25-remote-conf.jpg %}
▲ 远程主机配置

接着连接远程主机，后期可以用密钥对进行验证，那样就不会输入密码了。如果是初次连接，会在远程主机安装 VS Code 的服务程序。其安装路径为 `~/.vscode-server/`，VS Code 的远程插件也是安装在这个路径下。

{% asset_img 2019-07-25-connent.jpg %}
▲ 连接远程主机

连接成功后，选择项目的路径，打开项目文件。

{% asset_img 2019-07-25-complete.jpg %}
▲ 打开远程项目

## 关于远程插件

VS code 可以将插件安装在本地，即宿主机上，也可以将插件安装在远程主机上。需要注意的事，与开发环境相关的插件，要安装在与项目同一个主机上。即是说，远程的项目，用的是远程主机的环境，就得将插件安装在远程主机上。

此前，我就遇到一个情况，打开远程项目（在远程的 Linux 主机）后，然后在项目中进行代码的跟踪，在查看跟踪到的代码文件的路径时，发现是 Windows 上的（我的宿主机是 Windows）。对于这情况显然不是我所希望的。后面排查到是插件的问题。正确、合理的方法的，将相应的开发环境的插件，安装在项目所在的主机上。

PS: 后来我想复现一下上面情况结果不行了，是我弄混了还是我的错觉...

## django 和 Vue Debug 的基本配置

连接远程主机，并分别创建 django 和 Vue 的项目。

{% asset_img 2019-07-26-dev-create.jpg %}
▲ 创建测试项目

### django

{% asset_img 2019-07-26-debug-django.jpg %}
▲ 创建 django 类型的 Debug 配置

> .vscode/launch.json

``` json
"configurations": [
    {
        "name": "Python: Django",
        "type": "python",
        "request": "launch",
        "program": "${workspaceFolder}/manage.py",
        "args": [
            "runserver",
            "--noreload",
            "0:8000"
        ],
        "django": true,
        "console": "integratedTerminal"
    }
]
```

`--noreload` 选项需要留住，不然在 Shift+F5 停止 Debug 后，django 的服务是不会自己停止的，在下次启动 Debug 时就会失败。

### Vue

{% asset_img 2019-07-26-debug-npm.jpg %}
▲ 创建用于 vue 的 Node.js npm 类型的 Debug 配置

> .vscode/launch.json

``` json
"configurations": [
    {
        "type": "node",
        "request": "launch",
        "name": "Launch via NPM",
        "runtimeExecutable": "npm",
        "runtimeArgs": [
            "run-script",
            "serve"
        ],
        "console": "integratedTerminal"
    }
]
```

根据实际情况修改配置。另外，要加上 `"console": "integratedTerminal"`，使用可以交互的终端类型，不然可能会“卡死”。

## 参考

<https://code.visualstudio.com/docs/remote/remote-overview>