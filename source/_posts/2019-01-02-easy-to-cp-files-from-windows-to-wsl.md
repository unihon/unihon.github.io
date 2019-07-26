---
layout: post
title: easy to cp files from windows to wsl
categories:
  - Linux
tags:
  - shell
  - WSL
asciinema: false
date: 2019-01-02 21:16:18
updated: 2019-01-02 21:16:18
---

一个方便从windows复制文件或者目录到wsl的一个shell脚本。

<!-- more -->

![](/2019-01/easy-to-cp-files-from-windows-to-wsl/20190102_demo.gif)
▲ 效果

源码如下

``` bash
str=$1

tmp=${str//\\/\/}
row=${tmp//\ /\\ }

typeset -l partition=$(echo $row|cut -d ":" -f1)
uri=$(echo $row|cut -d ":" -f2)
uri_l="/mnt/"${partition}${uri}

echo $uri_l|xargs -i cp -r {} .

```

字符串要替换第一个匹配的目标，写法为`${str/old/new}`，若要全部替换则为`${str//old/new}`。

主要要记下`xrags的用法`，下面是man xrags的解释。

``` 
-I replace-str
              Replace occurrences of replace-str in the initial-arguments with names read from standard input.  Also,
              unquoted  blanks do not terminate input items; instead the separator is the newline character.  Implies
              -x and -L 1.

-i[replace-str], --replace[=replace-str]
              This option is a synonym for -Ireplace-str if replace-str is specified.  If the replace-str argument is
              missing, the effect is the same as -I{}.  This option is deprecated; use -I instead.

```

`-I`和`i`大体上的意思是将xrags导过来的数据用`{}`取代

另外`cut`用`-d`选项指定分隔符，默认为制表符（TAB）。

---

- [脚本链接](https://github.com/unihon/shell/tree/master/wcp)
