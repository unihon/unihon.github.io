---
layout: post
title: build-the-lnmp-with-docker
categories:
  - docker
tags:
  - lnmp
  - linux
  - nginx
  - mariadb
  - php
asciinema: false
date: 2019-03-26 19:48:51
updated: 2019-03-26 19:48:51
---

docker推崇单镜像单个服务，所以使用[nginx](https://hub.docker.com/_/nginx)、[php](https://hub.docker.com/_/php)、[mariadb](https://hub.docker.com/_/mariadb)三个镜像搭建lnmp，为了减小体积，除了mariadb，其他镜像统一使用alpine的版本。

<!-- more -->

因为是开发测试所用的lnmp环境，所以这是搭建lnmp只是单纯的“多容器应用”，与多`service`应用`stack`不同的是，容器应用不需要使用`swarm mode`。

{% asset_img 20190326_tree.png %}
▲ 目录结构

## docker-compose.yml

``` yml
version: "3.5"
services:
    nginx:
        build: ./nginx
        image: nginx:alpine-lnmp
        ports:
            - "80:80"
        volumes:
            - /home/docker/lnmp:/var/www/html
        networks:
            - lnmp
    php-fpm:
        build: ./php-fpm
        image: php:fpm-alpine-lnmp
        volumes:
            - /home/docker/lnmp:/var/www/html
        networks:
            - lnmp
    mariadb:
        image: mariadb:latest
        environment:
            MYSQL_ROOT_PASSWORD: root
            MYSQL_USER: username
            MYSQL_PASSWORD: abc
        volumes:
            - /home/docker/db_data:/var/lib/mysql
        networks:
            - lnmp

networks:
    lnmp:
        name: lnmp
```

为了网站页面资源能够在nginx和php容器间共享，且为了方便调试，这里使用的`bind mount`的方式将主机目录同时挂载到nginx和php对应的网站根目录。为了数据库的数据持久化，也对其使用volume或者挂载本地目录，可以通过镜像说明的配置方法预先对数据库进行一些配置，更多信息可以参阅[mariadb docker-hub的说明](https://hub.docker.com/_/mariadb)。

## dockerfile

### nginx

dockerfile

``` dockerfile
FROM nginx:alpine
RUN ["mkdir","-p","/var/www/html"]
COPY ./default.conf /etc/nginx/conf.d
```
nginx的配置文件。

``` nginx
server {
	listen       80;
	server_name  localhost;

	location / {
		root   /var/www/html;
		index  index.html index.php;
	}

	error_page   500 502 503 504  /50x.html;
	location = /50x.html {
		root   /var/www/html;
	}

	location ~ \.php$ {
		root   /var/www/html;
		fastcgi_pass   php-fpm:9000;
		fastcgi_index  index.php;
		fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
		include        fastcgi_params;
	}
}
```

### php-fpm

dockerfile

``` dockerfile
FROM php:fpm-alpine
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
docker-php-ext-install mysqli && \
docker-php-ext-install pdo_mysql
```

php镜像给php安装扩展，这里用的是镜像提供的便捷脚本`docker-php-ext-install`，这个脚本是通过编译扩展源码的方式安装扩展，因此，在此之前会自动下载、安装一系列的开发工具，如gcc等，在完成对扩展源码的编译、安装工作后会自动清除此前的编译环境，所以不用担心最后的生成的镜像会存在一些不需要的开发工具。官方php镜像提供了好几种安装扩展的方法，更多信息可以参阅[php docker-hub的说明](https://hub.docker.com/_/php)。当然，也可以自己直接通过包管理工具下载安装扩展，不过需要注意，扩展的版本与php的版本不一致，可能会不兼容。

{% asset_img 20190326_up.png %}
▲ 启动lnmp，查看多容器应用lnmp状态

{% asset_img 20190326_show.png %}
▲ 运行效果
