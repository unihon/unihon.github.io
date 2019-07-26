---
layout: post
title: directly-use-docker-s-unix-socket-type-api
categories:
  - Docker
tags:
  - API
  - HTTP
  - socket
  - Python
asciinema: false
toc: true
date: 2019-04-25 21:34:53
updated: 2019-04-25 21:34:53
---

直接使用 docker 的 unix-socket 类型 API。

<!-- more -->

## Docker engine API 说明 [[1]]

docker engine有三种类型的API。

1. unix (socket)
2. tcp (socket)
3. fd (Systemd socket)

**注意：**

fd 的 socket 文件默认也是绑定在本地的 `/var/run/docker.sock`，这个和 unix-sock 的 socket 文件路径一样，而且 fd 和 unix socket 在访问上“好像”并没什么区别，更多特性上细节上的还待考究。

下面是 docker engine 的部分 systemd 的启动脚本，更多请参阅[github moby](https://github.com/moby/moby/blob/master/contrib/init/systemd/docker.socket)。

``` ini
[Unit]
Description=Docker Socket for the API
PartOf=docker.service

[Socket]
ListenStream=/var/run/docker.sock
SocketMode=0660
SocketUser=root
SocketGroup=docker

[Install]
WantedBy=sockets.target
```

因为主机是 CentOS ，使用的是 systemd，后面所说的 unix-socket 实际上是 fd ，不过我在API操作上并没有感觉到有什么不同，所以就统一称为 unix-socket。

通常情况下，接触最多的应该是 docker engine 的 TCP 类型的 API 了，也就是通过 `Host:Port` 的形式访问 API。例如：

``` bash
curl http://$HOST:2375/info
```

除此 docker engine 还有 unix-socket 类型的 API，docker-cli 默认就是通过这个 API 访问 docker engine。我们也可以直接使用 unix-socket 类型的 API。例如：

``` bash
curl --unix-socket /var/run/docker.sock http:/info
```

相比之下，TCP 类型的 API 要比 unix-socket 类型的 API 更容易使用。对于 unix-socket 类型，需要自己构造 HTTP 协议的报文等；而 TCP 类型的 API 已经帮我们处理了很多细节上的东西。但是，如果是开发，首选的应该是使用 unix-socket 类型的 API。

关于 docker 开发，docker 官方已经提供了 go 和 pyton 的 SDK，除此还有很多非官方版本的 SDK，如 C、java 等。使用 SDK，可以让开发更加的快捷，便利。如果想定制自己的 “SDK” 或只是想利用其中的一部分 API，则可以针对 docker engine 的 API 自己独立进行开发，这也是文章的主题。

## 概览

Docker engine 提供的是 HTTP （协议）的 API，要使用 docker engine unix-socket 类型的 API，需要对以下知识有一定的了解。

- unix-socket
- HTTP Protocol

## unix-socket

`socket` 用于网络编程，可以使不同的的机器进行通信，这类（TCP socket）需要绑定一个主机的 IP 及 Port。

> unix - sockets for local interprocess communication.

unix-socket 用于本地进程间的通信， TCP socket 也可以通过绑定本地IP，`127.0.0.1` 实现“本地”进程间的通信，不过 unix-socket 的效率会更高。

## HTTP Protocol [[2]]

### HTTP 报文结构

{% asset_img 20190426_http_message.jpg %}
▲ HTTP（通用）报文结构

{% asset_img 20190426_http_request_message.jpg %}
▲ HTTP 请求报文结构

{% asset_img 20190427_http_request_message_request_line.jpg %}
▲ HTTP 请求报文 Request-Line

{% asset_img 20190427_http_message_body.jpg %}
▲ HTTP 报文 Message Body

> 注：一个CRLF由\r和\n构成，即CRLF=\r\n

*An entity consists of entity-header fields and an entity-body, although some responses will only include the entity-headers.*

#### message-body 和 entity-body 

*The message-body (if any) of an HTTP message is used to carry the entity-body associated with the request or response. The message-body differs from the entity-body only when a transfer-coding has been applied.*

*The entity-body is obtained from the message-body by decoding any Transfer-Encoding that might have been applied to ensure safe and proper transfer of the message.*

HTTP 报文的 message-body 用于携带与请求或响应关联的 entity-body。message-body 只有在应用“传输编码”时，才与 entity-body 不同。

#### message-length 和 entity-length

*The transfer-length of a message is the length of the message-body as it appears in the message; that is, after any transfer-codings have been applied.*

*The entity-length of a message is the length of the message-body before any transfer-codings have been applied.*

一个报文中的 transfer-length 长度是报文包含 message-body 时，message-body 应用传输编码之后的长度。  
一个报文中的 entity-length 长度是 message-body 在应用传输编码之前的长度。

### Header

HTTP 主要有三类 Header Fields，`general-header`、`request-header`、`entity-header`，不同类别的 Header Fields 修饰的主体也不一样。这里简单说下需要用到的几个 Header Fields。

#### Host

*A client MUST include a Host header field in all HTTP/1.1 request messages.*  
Host 是 request-header 的 field，在 HTTP/1.1 的请求报文中必须使用。

#### Content-Type

*Any HTTP/1.1 message containing an entity-body SHOULD include a Content-Type header field defining the media type of that body.*  
Content-Type 是 entity-header 的 field，HTTP/1.1的报文，如果包含 entity-body 则中必须使用。

#### Content-Length

*The Content-Length entity-header field indicates the size of the entity-body.*

*In HTTP, it SHOULD be sent whenever the message's length can be determined prior to being transferred, unless this is prohibited by the rules in section 4.4.*

*For compatibility with HTTP/1.0 applications, HTTP/1.1 requests containing a message-body MUST include a valid Content-Length header field unless the server is known to be HTTP/1.1 compliant.*

在 HTTP/1.1 报文最好包含 Content-Length，主要是兼用 HTTP/1.0。

## Docker engine API 参考 [[3]]

参考 API 的简要使用说明。

{% asset_img 20190425_api_image_create.jpg %}
▲ create image

其中的 `Query Parameters` 是指在附加在 URL 的参数，如 `abc.com?key_0=value&key_1=value`。

{% asset_img 20190425_api_image_create_do_0.jpg %}
▲ 通过 API 创建 image 演示

{% asset_img 20190425_api_image_create_do_1.jpg %}
▲ 通过 API 创建 image 结果

{% asset_img 20190425_api_containers_create.jpg %}
▲ create container

`REQUEST BODY` 是放在 HTTP 报文中的 `Message-Body` 的数据，除此还需要在 HTTP 报文头指定 `Content-Type` 和 `Content-Length`。

{% asset_img 20190425_api_containers_create_do_0.jpg %}
▲ 通过 API 创建 container 演示

{% asset_img 20190425_api_containers_create_do_1.jpg %}
▲ 通过 API 创建 container 结果

{% asset_img 20190425_api_containers_Inspect_do_0.jpg %}
▲ 通过 API 查看 container 信息

## 使用 python 访问 unix-socket API

``` python
#!/usr/bin/python3
# -*- coding: UTF-8 -*-
import socket

SK = "/var/run/docker.sock"
# docker engine socket 文件路径

s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
# 使用 socket.AF_UNIX 指定使用的是 unix-socket 类型的 socket，如果是 TCP 类的 socket，则是 socket.AF_INET 等。

s.connect(SK)

msg = (
"GET /version HTTP/1.1\r\n"
"Host: /\r\n"
"\r\n"
)
# 这里是关键，不要直接向 socket 发送一个“无格式”的请求，如 “GET /version”。

s.sendall(msg.encode('utf-8'))

raw_data = []
while True:
    tmp_data = s.recv(1024)
    if not tmp_data: break
    raw_data.append(tmp_data)

recv_b = b"".join(raw_data)
print(recv_b.decode('utf-8'))

s.close();
```

如前面所说，docker engine 提供的是 HTTP 协议的 API，所以这里需要自己构造 HTTP 报文，而不能直接发送非 HTTP 报文结构的数据。

``` python
msg = (
"GET /version HTTP/1.1\r\n"
"Host: /\r\n"
"\r\n"
)
```

`Host` field 在 HTTP/1.1 中必须包含。实际，在这里，`Host` 只是为了符合 HTTP/1.1 报文的结构，`Host` 的值无关紧要，如`/a`、`/b`、`localhost`得到结果是一样的。

{% asset_img 20190427_py_0.jpg %}
▲ 执行结果

API 响应的也是一个完整的 HTTP 报文。

只要更改请求的 HTTP 报文信息，就可以请求 API 的不同内容。

``` python
body = '{"Image":"nginx:alpine"}'
c_l = str(len(body))

msg = (
"POST /containers/create?name=mypy HTTP/1.1\r\n"
"Host: /\r\n"
"Content-Type: application/json\r\n"
"Content-Length: {c_l}\r\n"
"\r\n"
"{body}"
).format(c_l = c_l, body = body)
```

如果包含 Message-Body，必须要指定 `Content-Type`，其类型为 `application/json` ，除此还需要计算 `engine-length`。

{% asset_img 20190427_py_1.jpg %}
▲ 执行结果


## 参考

\[1\] https://docs.docker.com/engine/reference/commandline/dockerd/  
\[2\] https://tools.ietf.org/html/rfc2616  
\[3\] https://docs.docker.com/engine/api/v1.39/

[1]: https://docs.docker.com/engine/reference/commandline/dockerd/
[2]: https://tools.ietf.org/html/rfc2616
[3]: https://docs.docker.com/engine/api/v1.39/
