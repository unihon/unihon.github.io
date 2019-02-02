---
layout: post
title: deploy github pages with Travis-CI automation
categories:
  - development
tags:
  - Tranvis-CI
  - github-pages
  - hexo
asciinema: false
toc: true
date: 2019-02-01 17:44:53
updated:
---

# 前言

目前博客用的是hexo，github pages默认只对jekyll有转换原始文件（md）为静态文件的支持。所以，hexo需要在本地将原始文件转换成静态文件，然后在hexo d部署上去。

看到了Travis-CI，对此了解了下，并对原来的文章部署方式做了一下“升级”。

``` bash
#!/bin/bash
hexo clean && hexo d && hexo clean
git add .
git commit -m "update: $(date)"
git push origin hexo_uni
```

上面是我原本“一键部署文章”的脚本，大致上分两个部分，生成并部署静态文件，还有push上传原始文件。

如果利用Travis-CI的话，自己手上的工作就只有push上传原始文件，而静态文件的生成和部署则全部交给Travis-CI处理，这个效果其实和jekyll基本是一样的了。这样一来我现在的“一键部署文章”的脚本就只需要下面的内容（就是一次普通的git操作）。

``` bash
#!/bin/bash
git add .
git commit -m "update: $(date)"
git push origin hexo_uni
```

原来要想在另一台电脑上写作，除了要将原文件从仓库clone下来，还得安装node环境等。现在只要求一台联网并安装git的电脑，就可以上手写作并部署文章。（当然，想要本地预览，还是得安装node等相关环境）

## Travis-CI

> Travis-CI只支持github

- [Travis-CI org官网](https://travis-ci.org/)
- [Travis-CI 文档的说明](https://docs.travis-ci.com/user/for-beginners/)

利用Travis-CI可以在项目更新时（比如将本地更新后的代码push到github）自动化的处理、执行一些原本需要开发人员手动操作的工作。

按原本的开发-测试-部署流程，每次的项目更新都意味着需要在运行环境中进行新一轮的测试、部署。如果是频繁的小更新，而每次都得从头的一步一步的在运行环境中部署，显然是个很“艰难”的过程。大多数人应该都会选择将多个的小更新积累成一个相对大的“版本”再统一部署，也不会选择每次为了一个小小的改动而频繁去做繁重的部署工作。如果利用Travis-CI，那么开发人员只需要关心项目的更新，项目的部署工作则全由Travis-CI处理。这样哪怕再频繁的小更新，都能很轻松的（自动部署）看到项目最终的运行效果。

这些将Travis-CI里的“自动部署”的关键词用上。

## 配置Travis-CI的大概流程

### 生成token

可以先在github上面生成一个token，用于Travis-CI端向github部署时的认证凭证。

github生成token的步骤请参阅[Creating a personal access token for the command line](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)。

![](/2019-02/deploy-github-pages-with-travis-ci-automation/2019-02-01_create_token.png)
▲ 在生成token时，只给接入（读写）权限就可以了

### 登录Travis-CI

在Travis-CI org官网登录（用github账号直接登录）。

![](/2019-02/deploy-github-pages-with-travis-ci-automation/2019-02-01_travis_ci_index.png)
▲ Travis-CI主页

### 同步仓库

在Travis-CI同步github仓库（如果没自动同步则手动同步）。

### 激活仓库

激活要配置Travis-CI的仓库。

![](/2019-02/deploy-github-pages-with-travis-ci-automation/2019-02-01_active_repo.png)
▲ 激活github pages仓库

### 添加环境变量

在Travis-CI进入仓库的控制台，添加token的环境变量。

不希望公开的环境变量可以在控制台添加，如果只是普通的变量可以直接写在yml文件。

![](/2019-02/deploy-github-pages-with-travis-ci-automation/2019-02-01_set_token.png)
▲ value是前面第1步生成的token，可以选择在build log中不显示

### 注意

现在Travis-CI的基本配置已经完成了，如果还有其他的需要，请参阅[Travis-CI的文档](https://docs.travis-ci.com/)。

需要注意的是，Travis-CI有商业版和社区版之分，其中商业版是收费的，这是讲的是免费的社区版。商业版的Travis-CI主页网址是以**com**结尾，社区版为**org**，两个网站的风格基本是一样的，不过两个并不相通，需要独立配置。还有社区版的文档导向的是商业版的参阅文档，如果在从文档的网页直接点跳转回主页，到达的是社区版的主页，需要留意下。

## 配置.travis.yml文件，自动化部署github pages

.travis.yml需要放在项目的根目录。在项目新时便会触发Travis-CI，Travis-CI会根据.travis.yml文件的配置内容执行。

``` yml
# 指定语言环境
language: node_js
# 指定版本，这个个人建议最好加上，因为不同的node版本所对应的hexo插件版本可能也不一样、不兼容，
# 因为配置环境时的npm install是从定死的package.json文件中的依赖列表中的条目下载的，
# 如果版本不一样，则很大机率会失败
node_js:
  - 10.8.0

# 缓存node_modules文件夹，下次build时可以快些
cache:
  directories:
    - node_modules

# S: Build Lifecycle
# 安装环境
install:
  - npm install

before_script:
  - export TZ=Asia/Shanghai

# 生成静态文件
script:
  - hexo g

# 将生成的静态文件部署到github，
# 因为原本的hexo d是通过ssh或者手动输入用户信息进行认证的，在Travis-CI再用这种方法会比较麻烦，有其他更简单的方法代替，如token，
# 因为只需要将生成的静态内容部署到github，所以就不能在原有仓库（源码仓库）的基础上上传，推荐两个方法：
# 1. 常规方式：
# 在生成的静态文件的文件夹内新初始化一个仓库，在强制push到github的pages主分支，之所以要强制，
# 是因为这种文件每次的部署都是将一个新的仓库部署上去，版本号冲突是一定的。
# 这种方法是直接用git cli，可以将所有的命令写到yml的script。
# 这种方法的缺点是不能保留静态文件的commit记录（其实也不重要）。
# 2. Travis-CI提供的快捷部署方式：
# 也就是个人目前用的方法，如下
deploy:
  provider: pages
  skip-cleanup: true
  # 在Travis-CI控制台设置的token环境变量
  github-token: ${GH_TOKEN}
  keep-history: true
  # 可选，github用户名
  name: unihon
  # 可选，github邮箱
  email: unihon@outlook.com
  # 如果是用同一个仓库的两个分支分别存放源文件和静态文件，local-dir和target-branch是必选
  # 要上传的静态文件的路径
  local-dir: ./public
  # 将local-dir指定的文件（静态文件）上传到的分支，也就是pages分支
  target-branch: master
  # 工作分支，也就是你仓库源码的分支
  on:
    branch: hexo_uni

# 当hexo_uni分支更新时触发
branches:
  only:
    - hexo_uni
```

github pages快捷部署的详细说明请参阅[github pages快捷部署方式官方文档](https://docs.travis-ci.com/user/deployment/pages/)。

## 查看Travis-CI的build情况

在仓库更新时，就会触发Travis-CI。因为Travis-CI每次的build过程都是从一个新的环境开始，所以需要一点时间（具体时间因项目内容而定）。

![](/2019-02/deploy-github-pages-with-travis-ci-automation/2019-02-01_build.png)
▲ 项目更新后，在Travis-CI控制台查看build情况。

在控制台可以查看build仓库的相关以及build的日志，日志中有构建过程中每一步的信息。

![](/2019-02/deploy-github-pages-with-travis-ci-automation/2019-02-01_build_error.png)
▲ build失败（com例子）

![](/2019-02/deploy-github-pages-with-travis-ci-automation/2019-02-01_mail.png)
▲ 通知邮件（com例子）

如果buidl失败会有邮件通知，邮件中也会有相关日志信息，方便排除问题。

## 参考

- [https://docs.travis-ci.com/ ](https://docs.travis-ci.com/)
- [https://blog.csdn.net/duzilonglove/article/details/79012499 ](https://blog.csdn.net/duzilonglove/article/details/79012499) 
- [https://molunerfinn.com/hexo-travisci-https/ ](https://molunerfinn.com/hexo-travisci-https/)
