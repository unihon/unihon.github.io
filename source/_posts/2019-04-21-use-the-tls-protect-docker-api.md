---
layout: post
title: use-the-tls-protect-docker-api
categories:
  - Docker
tags:
  - TLS
  - HTTPS
  - API
  - OpenSSL
asciinema: false
toc: true
date: 2019-04-21 19:05:39
updated: 2019-04-21 19:05:39
---

使用TLS保护docker daemon的API。

<!-- more -->

## 前言

如果不使用TLS和不使用相关客户端证书对客户端身份进行验证，那么能够于服务器进行通信的任何主机（假设未进行其他防护措施），都可以访问该服务器上的docker daemon的TCP API（下称API）。

{% asset_img 20190421_no_https.jpg %}
▲ 未对客户端进行验证，API暴露

其实这是一个非常危险的行为，拥有API的访问权相当拥有了整个docker client（甚至更多）的功能。比如说通过API使用`mount bind`将服务器的某些重要目录（`/`，`/etc/`...）挂载到一个容器内部，通过容器就可以直接的对挂载进来的文件（夹）进行操作。

## 使用 openssl 创建证书

首先是创建一个私有的CA根证书，然后使用此证书分别对服务端证书和客户端证书进行签名。

### 证书请求文件资料

| 缩写 | 含义 |
| - | - |
| C | Country Name |
| S | State or Province Name |
| L | Locality Name |
| O | Organization Name |
| OU | Organization Unit Name |
| CN | Common Name |
| emailAddress | Email Address |

CN设置哪个主机可以使用这个证书（客户端好像没这个限制）。  
默认情况下，OpenSSL创建的证书只包含一个CN而且只能设置一个主机名。  

#### 例子（不同服务情况可以不一样）

如果服务器IP为1.1.1.1，并且申请一个证书，其CN为1.1.1.1。  
那么将只能通过1.1.1.1访问服务器中使用此证书的服务。  
如果在内部通过127.0.0.1、localhost，或者是主机的域名，访问服务器的中使用此证书的服务，会有如下指示：  
*unable to communicate securely with peer: requested domain name does not match the server's certificate.*

因为这个限制，即便你有其他相关联的站点，也不得不为每个站点生成一张单独的证书。解决方案是使用多域名的证书，实现方法有`X.509`的`SAN`（subjectalternative name）和泛域名（类似使用通配符）。  
需要注意的是，如果使用`SAN`，CN将不生效。

### 创建CA根证书

1. 生成CA私钥【ca-key.pem】
2. 通过CA私钥【ca-key.pem】生成证书签名请求文件【ca.csr】
3. 对证书签名请求文件【ca.csr】进行自签名生成CA根证书【ca.pem】

``` bash
# 生成CA私钥【ca-key.pem】
openssl genrsa -out ca-key.pem 2048
# 通过CA私钥【ca-key.pem】生成证书签名请求文件【ca.csr】
penssl req -new -key ca-key.pem -out ca.csr
# 对证书签名请求文件【ca.csr】进行自签名生成CA根证书【ca.pem】
openssl x509 -req -in ca.csr -out ca.pem -signkey ca-key.pem -days 365
# 可以将2、3结合成一步
openssl req -new -x509 -days 365 -key ca-key.pem -out ca-cert.pem
```

### 创建服务端证书

1. 生成server私钥【server-key.pem】
2. 通过server私钥【server-key.pem】生成证书签名请求文件【server.csr】
2. 使用CA根证书【ca.pem】对服务端的证书签名请求文件【server.csr】进行签名生成服务端证书【server.pem】

先创建一个X509V3扩展文件【extfile.cnf】，说明证书的用途，还有设置`SAN`，使一个证书可能支持多个主机。

``` bash
extendedKeyUsage = serverAuth
subjectAltName = IP:192.168.0.4,IP:127.0.0.1,IP:0.0.0.0,DNS:localhost
```


``` bash
# 生成server私钥【server-key.pem】
openssl genrsa -out server-key.pem 2048
# 通过server私钥【server-key.pem】生成证书签名请求文件【server.csr】
penssl req -new -key server-key.pem -out server.csr
# 使用CA根证书【ca.pem】对服务端的证书签名请求文件【server.csr】进行签名生成服务端证书【server.pem】
openssl x509 -req -in server.csr -out server-cert.pem -CA ca.pem -CAkey ca-key.pem -CAcreateserial -days 365 -extfile extfile.cnf
```

### 创建客户端证书

客户端证书和服务端证书的创建流程基本一样。

X509V3扩展文件【extfile.cnf】

``` bash
extendedKeyUsage = clientAuth
```

在客户端中，客户端证书好像不受的CN及`SAN`的限制，这里就不设置了（有问题可以联系我）。


最后列下所需要的文件。

- CA根证书【ca.pem】
- 服务端证书【server.pem】
- 服务端私钥【server-key.pem】
- 客户端证书【clent.pem】
- 客户端端私钥【client-key.pem】

如果需要在像windows上面浏览器上面使用客户端的证书和私钥，需要将客户端证书和客户端私钥打包成一个证书文件。

``` bash
openssl pkcs12 -export -clcerts -in client.pem -inkey client-key.pem -out client.p12
```

对于CA根证书可以直接修改其后缀为`.cer`或者`.crt`。

## 配置docker daemon使用TSL

### Daemon配置

- *tlsverify, tlscacert, tlscert, tlskey* set: Authenticate clients  
**双向验证**  
要求验证客户端，其中包含的选项为ca、服务器证书、服务器私钥，且指定要求对客户端进行验证。

- *tls, tlscert, tlskey*: Do not authenticate clients  
**单向验证**（通常不使用这个模式）  
不要求验证客户端，其中包含的选项为ca、服务器证书、服务器私钥。

dockerd v18.09的配置配置文件路径为`/etc/docker/daemon.json`。因为是设置双向验证的模式，所以需要在配置的选项有`tlsverify`、`tlscacert`、`tlscert`、`tlskey`。

``` json
{
	"tlsverify": true,
	"tlscacert": "/root/docker-ca/ca.pem",
	"tlscert": "/root/docker-ca/server/server-cert.pem",
	"tlskey": "/root/docker-ca/server/server-key.pem"
}
```


需要注意的是，如果是使用`systemd`的系统，不能够在`daemon.json`中设置`hosts`，因为docker在`systemd`的启动脚本中已经使用了`-H`选项（与`hosts`作用一样）,重复使用的话，将导致dockerd启动失败。

原文：

> Note: You cannot set options in daemon.json that have already been set on daemon startup as a flag. On systems that use systemd to start the Docker daemon, -H is already set, so you cannot use the hosts key in daemon.json to add listening addresses. See https://docs.docker.com/engine/admin/systemd/#custom-docker-daemon-options for how to accomplish this task with a systemd drop-in file.

在使用`systemd`的系统中配置`-H`（`hosts`）的方法是配置docker的`systemd`启动脚本。

``` bash
systemtcl edit docker.service
```

``` bash
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:2376
```

注意前面留空的`ExecStart`不能省略。

关于`2376`和`2375`端口，通常`2376`是在使用TSL时的API时使用的端口，而`2375`是没有使用TSL时的API端口，虽然不是硬性规定，不过还是应该遵循规范。

重启dockerd生效。

## 测试docker daemon TSL API

{% asset_img 20190421_no_client.jpg %}
▲ 只安装CA根证书，不使用客户端证书

在没有客户端证书的情况下，服务端对客户端的身份验证不通过，访问API失败。

{% asset_img 20190421_load_client.jpg %}
▲ 安装客户端证书，访问服务端时要求验证客户端身份，选择证书

{% asset_img 20190421_ok.jpg %}
▲ 验证成功，成功访问API

## 参考

- <https://docs.docker.com/engine/security/https/>
- <https://unihon.github.io/2019-04/docker-api-https-installa-the-certificate-on-windows/>
- <<HTTPS权威指南>> Ivan Ristić
