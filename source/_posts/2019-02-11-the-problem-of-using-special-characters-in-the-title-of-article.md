---
layout: post
title: the problem of using special characters in the title of the article
categories:
  - web
tags:
  - characters
  - title
  - hexo
asciinema: false
date: 2019-02-11 23:21:26
updated: 2019-02-11 23:21:26
---

在给文章的title加入一个方括号`[]`后，在生成静态文件时报错了，并且给title新加入的方括号也没有生效。

<!-- more -->

{% asset_img 20190211_title_error.png  %}
▲ 给title加入`[]`后报错

想下应该需要转义一下，后面给`[]`加上`\`。

{% asset_img 20190211_title_no.png  %}
▲ 加上转义字符后，报错消除

加上转义字符后，报错消除了，不过在生成的title中转义字符也跟着出来了。后面接着试了下`*`之类的字符，情况和`[]`一样。

为此还特地去现在博客用的Markdown解释器`marked`的github上面看了一下配置，请参阅[hexo-renderer-marked](https://github.com/hexojs/hexo-renderer-marked)。改了几个配置发现都没什么变化。后面直接给title试了几个MD的标签，证实title不经MD解释器处理~~白折腾一番。

最后是通过加title加个双引号`""`给解决了。

{% asset_img 20190211_title_ok.png  %}
▲ 给title加上`""`后，正常显示特殊字符

解决问题，需要“有根据”的进行推敲（~~其实是瞎折腾~~）...
