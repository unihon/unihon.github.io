---
layout: post
title: update-html-syntax-indentation-on-vim7
categories:
  - tools
tags:
  - vim
  - html
  - syntax
  - indent
asciinema: false
date: 2019-06-07 09:34:03
updated: 2019-06-07 09:34:03
---

更新 vim7 的 html 语法缩进脚本。

<!-- more -->

同样是执行 `gg=G` 对 html 文件进行语法的格式化（缩进），不过在 `centos7` 上面的 vim7.x 并没有按预期那样工作。接而安装了一个 vim8.1.x 进行比对测试，结果是 vim8.1.x 可以对 html 进行合理的语法格式化。

{% asset_img 20190607_vim7_html_indent.png %}
▲ vim7.x

{% asset_img 20190607_vim81_html_indent.png %}
▲ vim8.1.x

排查出是因为 vim7.x runtime 里面 html.vim indent 语法缩进脚本版本过旧。解决方法是将 vim8.1 的 html.vim indent 语法缩进脚本复制到 vim7.x runtime 的 indent 目录。可以通过 `:echo $VIMRUNTIME` 查看 runtime 目录的路径。或者是复制到 `~/.vim/indent/`，比较推荐复制到家目录下。

关于 indent 脚本的获取。在 [vim 的官网](https://www.vim.org/)上的 vim 脚本版本基本是 vim7 时代的，并不新。

{% asset_img 20190607_html_indent.png %}
▲ 从上至下分别是 vim 官网、vim7.x 、vim8.1x 的 html.vim

较新的 vim 脚本可以到 [vim 的 github](https://github.com/vim/vim) 源码里下载。另外不推荐直接将整个 runtime 替换更新，没测试过，或许有不兼容。
