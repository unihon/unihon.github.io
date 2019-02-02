---
layout: post
title: bash command search
categories:
  - linux
tags:
  - bash
  - stty
  - hotkey
asciinema: false
date: 2019-01-19 21:53:26
updated: 2019-01-19 21:53:26
---

bash的历史命令搜索，个人常用的一个功能，其快捷键为C-R。C-R的功能是增量反向搜索，即根据输入的关键词从history中反向搜索，返回与关键词匹配的第一条命令（history中匹配的最后一条）。

<!-- more -->

如果停止输入然后继续按C-R，则返回与关键词匹配的第二条命令（history中匹配的倒数第二条），以此类推。

所谓增量，搜索返回匹配命令的history号码（offset偏移量）会在每次返回匹配命令时发生变化。比如在第一次使用C-R搜索到的命令，到第二次再用C-R搜索同样的关键词就不会再返回样的命令，原因是第二次的搜索结果是从第一次搜索到的命令的history的号码数（offset偏移量）基础上进行搜索。

然而，只能一个方向的搜索很不方便，实际上开发者并不是无脑就给这一个“反人类”的功能，其实还有一个增量正向的搜索，其快捷键为C-S。是不是很熟悉，这个快捷键我在刚开始用vim应该误按了不少，其功能是停止对标准输入的接收，即“冻屏”，这个按C-Q可以恢复。  

下面是bash手册的内容。

```
reverse-search-history C-r)
Search backward starting at( the current line and moving up' through the history as necessary. This is an incremental search.
forward-search-history C-s)
Search forward starting at the current line and moving down' through the history as  necessary. This is an incremental search.

```
但为什么按C-S没有得到想要的增量搜索的功能，而是给“冻屏”了。其实我也看了一些网上的bash快捷键归纳，多数上是只说了C-R这一个增量反向搜索的快捷键，有的也提到了C-S，不过也没提到“冻屏”相关的信息。

之所以bash的C-S增量搜索功能没生效，是因为C-S这一输入在bash接收之前已经被TTY的程序监听到，接收并响应了————“冻屏”。

解决方法是修改、关闭TTY的“冻屏”功能的快捷键，如执行`stty stop ""`,其中TTY更多的设置信息可以执行`stty -a`输出。另外也可以执行`stty -ixon`解决。

![](/2019-01/bash-command-search/20190119_bash_search.gif)
▲ bash历史命令搜索

除此还有M-R、M-S的非增量搜索命令，不过这两个命令只返回匹配关键词最近的第一条命令，而且不能预览匹配的命令。
