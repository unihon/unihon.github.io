---
layout: post
title: docker-api-https-installa-the-certificate-on-windows
categories:
  - cate
tags:
  - tag
asciinema: false
date: 2019-04-20 20:42:06
updated: 2019-04-20 20:42:06
---

在windows 10上面安装证书，访问docker使用了TLS的api。

现在我有一个通过docker-machine在本地创建的docker engine。因为其默认已经使用了双向验证的TLS，所以并不能通过http或者在没有相关证书的访问docker daemon的api。

<!-- more -->

{% asset_img 20190420_curl.jpg %}
▲ 没有相关证书，访问api失败

{% asset_img 20190420_doc.jpg %}
▲ curl使用证书相关文档

{% asset_img 20190420_ca.jpg %}
▲ curl使用证书访问api

因为是双向验证，服务端也需要验证客户端（curl）的身份，所以客户端需要提供客户端证书。   
其中`--cert`是指客户端证书，`--key`是指客户端的私钥，而`--cacert`则是客户端用来验证服务端证书的`CA根证书`。  
在使用相关证书后，curl成功的访问了docker daemon的api。因为没有指定相关的信息请求，所以这里返回了`{"message":"page not found"}`

接着，通过windows上的浏览器访问docker daemon的api，因为还没安装相关证书，所以失败了。

{% asset_img 20190420_web_no_ca.jpg %}
▲ 未安装证书时访问api

下面，在docker machine的默认目录`~/.docker/`，找到对应docker engine的证书文件。

{% asset_img 20190420_files.jpg %}
▲ docker engine相关文件

其中只有三个文件是我们需要的，如下：

- ca.pem：CA根证书
- cert.pem：客户端证书
- key.pem：客户端私钥

其他的则是服务端的证书，及docker engine的一些信息文件，关于服务端证书为什么也在这，是因为docker-machine在创建docker engine时，一些初始化工作是在宿主机（这里是我的WSL）进行的，包括生成证书的工作。

然后对证书格式进行转换，以在windows上面安装。

`ca.pem`CA根证书文件，直接修改后缀为`cer`或者是`crt`就可以让windows上的证书管理器识别了，这里的`.pem`后缀，指的是证书的编码为`PEM`，另外`DER`编码的证书直接修改后缀，也可以在windows上安装。

对于客户端证书和客户端私钥，需要将他们打包为一个证书文件。

``` bash
$ openssl pkcs12 -export -clcerts -in cert.pem -inkey key.pem -out docker_client.p12
```

> 关于PKCS#12：  
描述个人信息交换语法标准。  
描述了将用户公钥、私钥、证书和其他相关信息打包的语法。

{% asset_img 20190420_files_w.jpg %}
▲ 转换后的证书文件

在windows直接双击证书文件就可以安装。需要注意的是，CA根证书文件，需要将其安装在“受信任的根证书颁发机构”，不然可能会将证书识别为“无效证书”。客户端证书则可以按默认值安装。

<img id="sm" src="/2019-04/docker-api-https-installa-the-certificate-on-windows/20190420_load_ca.jpg">
▲ 开启子系统功能

{% asset_img 20190420_web_ca.jpg %}
▲ windows安装CA根证书后访问api

因为是是双向验证，这里只安装了CA根证书，还没安装客户端，所以服务端在验证客户端身份时没通过，访问失败。

在安装客户端证书后，继续访问api。

{% asset_img 20190420_web_load.jpg %}
▲ 提示选择证书

{% asset_img 20190420_web_ok.jpg %}
▲ 成功访问api

{% asset_img 20190420_web_info.jpg %}
▲ 通过api请求其他信息

在安装客户端证书后，在访问api时，如果服务端需要验证客户端身份，可以选择相关的客户端证书，如果验证成功，服务端则作出正常响应。

如果需要在windows上删除刚刚安装的证书，可以“运行 `certmgr.msc` ”，在证书管理器中管理相关证书。

{% asset_img 20190420_rm.jpg %}
▲ windows证书管理器

在“受信任的根证书颁发机构”里面，“颁发者”为“root”的证书，则是刚刚安装的CA根证书，可以查看相关信息进行再一步的确认；docker的客户端证书默认则是安装在“个人”的位置。

