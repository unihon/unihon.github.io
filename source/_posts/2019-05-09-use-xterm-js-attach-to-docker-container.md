---
layout: post
title: use-xterm-js-attach-to-docker-container
categories:
  - docker
tags:
  - xterm.js
  - API
asciinema: false
toc: true
date: 2019-05-09 07:55:31
updated: 2019-05-09 07:55:31
---

使用 `xterm.js` “attach” 到 docker 的容器。

<!-- more -->

# xterm.js

`xterm.js` 是一个前端组件，可以在中浏览器提供功能齐全的“终端”。只要，使用相关插件和提供相关功能的后端模块，就可以使用 `xterm.js` 在 web 中接入到 linux，除此，还能够接入到 docker 的容器。

xterm.js 已经“自带”了相关的后端和插件，如 `Terminado`，如果需要也可以自己开发一个。

## xterm.js 插件

- attach：用于 attach 到 docker 容器
- fit：自适应，指终端的窗口自适应，内容自动调整
- fullscreen：全屏
- terminado：用于和 xterm.js 的后端 Terminado 一起使用


# 使用 xterm.js 接入 linux

xterm.js 官网给了两个使用 Terminado 的例子，主要的区别是关于 xterm.js 的引用方式，这部分可以使用传统的方式直接引用 xterm.js 的 js 文件，也可以使用 ES6 的语法，引用相关模块，再“编译”。实际上 xterm.js 首推的是使用 ES6 的语法，不过这个例子我是直接引用预先“编译”好的 js 文件。

## 步骤

首先新建一个项目，下载、安装 xterm.js 和 Terminado。

``` bash
npm install --save xterm
pip install terminado
```
然后将 xterm.js 预先“编译”好的目标文件 `./node_modules/xterm/dist/` 复制到项目 root 目录。

接着在项目 root 目录下添加一个后端文件 `app.py` 和一个前端文件 `index.html`。

**app.py**

``` python
#!/bin/usr/python3

import tornado.web
from tornado.ioloop import IOLoop
from terminado import TermSocket, SingleTermManager

if __name__ == '__main__':
    term_manager = SingleTermManager(shell_command=['bash'])
    handlers = [
                (r"/websocket", TermSocket, {'term_manager': term_manager}),
                (r"/()", tornado.web.StaticFileHandler, {'path':'index.html'}),
                (r"/(.*)", tornado.web.StaticFileHandler, {'path':'.'}),
               ]
    app = tornado.web.Application(handlers)
    app.listen(8010)
    IOLoop.current().start()
```

**index.html**

``` html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="/dist/xterm.css" />
    <script src="/dist/xterm.js"></script>
    <script src="/dist/addons/terminado/terminado.js"></script>
  </head>
  <body>
    <div class="container">
      <div id="terminal-container"></div>
    </div>
    <script>
      terminado.apply(Terminal);

      var term = new Terminal(),
          protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://',
          socketURL = protocol + location.hostname + ((location.port) ? (':' + location.port) : '') + "/websocket";
          sock = new WebSocket(socketURL);

      sock.addEventListener('open', function () {
        term.terminadoAttach(sock);
      });

      term.open(document.getElementById('terminal-container'));
    </script>
  </body>
</html>
```

## 测试

最后运行 `app.py`。

{% asset_img 2019-05-09_xterm_ado.jpg %}
▲ xterm.js 接入 linux 效果

项目的关键文件为 `app.py`、`index.html` 及已经预先“编译”好的 xterm.js 目标 js 文件 `dist/`

# 使用 xterm.js attache 到 docker 容器

这部分使用 ES6 的方式引用 xterm.js，实际尝试过直接引用预先“编译”好的 js 文件，不过并没能成功，而官网也没“传统”引用方法的示例（这部分），所以还是直接选择“避坑”吧...

## 步骤

同样的新建一个项目，因为浏览器目前对 ES6 并不能 100% 支持，所以需要下载 `webpack`、`webpack-cli`、`webpack-dev-server`，用于打包（编译）、调试 js。

``` bash
npm install --save-dev webpack webpack-cli webpack-dev-server
```

接着下载 xterm.js。

``` bash
npm install --save xterm
```

{% asset_img 2019-05-09_xterm_attach_pack.jpg %}
▲ 项目包含的包（package.json）

### 配置 package.json 和 webpack


**package.json**

配置 npm 脚本，修改根目录下的 `package.json` ，在 `scripts` 添加如下内容。

``` json
{
    "scripts": {
        "dev": "webpack-dev-server",
        "build": "webpack --progress --mode=development"
    }
}
```

**webpack.config.js**

配置 webpack，在项目根目录下修改 webpack.config.js 文件。

``` JavaScript
path = require('path');
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'dist/bundle.js',
        path: path.resolve(__dirname, './')
    },
    devServer: {
        contentBase: path.join(__dirname, "./"),
        compress: true,
    }
};
```

> 注意：  
`output` 里的 `path` 为打包后的目标文件的路径，`devServer` 里的 `contentBase` 为 webpack-dev-Server 指定的 web root 目录，这两个需要一样，不然“热更新”可能无效。

开发环境配置好后，就可以进入主题了。

根据前面 `webpack.config.js` 的配置，在项目根目录下新建入口文件 `./src/index.js`。

**./src/index.js** 

``` JavaScript
import {Terminal} from 'xterm';
import * as attach from 'xterm/lib/addons/attach/attach';

Terminal.applyAddon(attach);

var term = new Terminal();
term.open(document.getElementById('#terminal'));

var ws_host = "192.168.0.4:2375";
var container = "test";

var ws = "ws://" + ws_host + "/containers/" + container + "/attach/ws?stream=true";
var socket = new WebSocket(ws);

term.attach(socket);
```

ws 的 URL，实际是 docker engine 的 API，需要注意的是，需要将 `stream` 设置为 `true`，不然即使连接上，也是无法传递数据的。

{% asset_img 2019-05-09_docker_ws_api.jpg %}
▲ 项目包含的包（package.json）

接着在项目 root 目录下新建 index.html。

**index.html**

``` html
<!doctype html>
<html>
    <head>
        <link rel="stylesheet" href="node_modules/xterm/dist/xterm.css" />
        <script src="node_modules/xterm/dist/xterm.js"></script>
    </head>
    <body>
        <h1>Hey!</h1>
        <div id="terminal"></div>
    </body>
    <script src="dist/bundle.js"></script>
</html>
```

到这里，所有的关键代码已经准备好了。

{% asset_img 2019-05-09_xterm_attach_tree.jpg %}
▲ 项目目录结构

## 测试

首先运行一个容器。

``` bash
docker run --name test -itd ubuntu:latest bash
```

在项目 root 目录执行 `npm run dev`，进行调试。

``` bash
npm run dev
```

{% asset_img 2019-05-09_xterm_attach.jpg %}
▲ xterm.js 接入 docker 容器效果

# 关于 xterm.js attach 到容器

docker engine 的 API 里面提供了两个 attach 到容器的方法。一个是和其他 API 一样使用 HTTP 协议的 attach，另一个为使用 websocket 协议的 attach。

在上面的说明（docker api的截图）中可以看到，docker engine 的 API 里面并没有对 websocket 有过多的解释。实际上，websocket 协议的 attach 和 HTTP 协议的 attche在“原理”上是一样的，只是他们的数据的传输方式不一样。

## docker attach

{% asset_img 2019-05-09_docker_attach.jpg %}
▲ docker attach 的解释

实际是 docker attach 是 “attach” 到容器创建时的 `ENTRYPOINT/CMD` 命令的进程（默认指PID 1进程）。如果在容器创建时通过 `-i` 让容器保持打开 `stdin`，“attach” 到容器后将可以与容器进行“交互”（如果条件合适）。

### 关于 `-i`

*Keep STDIN open even if not attached.*

`-i` 有两个作用；一、是会让容器保持stdin开放，二是、同时也会 attach 到容器的 stdin（即使通过 `-a` 指定 attach 到 stdxx）。

> 注：`-t`是给容器分配一个虚拟终端，也是关键。

docker create 或 exec 指定的 commond 会通过 stdin （这里应该是 API -> docker engine -> container，不过我简略了）在容器内执行，执行这“一次”结束后容器，将会关闭“此次”的 stdin；如果是使用 `-i`，将会保持stdin打开；要是commond进程可以交互，用户则可以输入命令，命令将继续通过开放stdin在容器内执行。

如上所述，attach 最终能不能交互还得看`ENTRYPOINT/CMD` 命令的进程自身有没有“交互”的功能，比如可以交互的有 `bash`、`top`，不能交互的有 `ls`等。

## xterm.js attach 的局限
到这里可以得出结论，xterm.js attach 到容器，最终能不能进行交互，和容器的 `ENTRYPOINT/CMD` 的命令有很大的关系。如果在创建容器时没指定 `-it` 或者 `ENTRYPOINT/CMD` 不是 `bash` 之类的可交互进程，xterm.js 虽然可以连接到容器，但都不可以与容器进行交互的。

而实际情况是，绝大多数的容器事业，这两个条件都没有。

## xterm.js 连接到容器的解决方案

使用 `exec`。
