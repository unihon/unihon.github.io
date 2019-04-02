---
layout: post
title: set-vim-to-automatically-recognize-dockerfile
categories:
  - vim
tags:
  - dockerfile
  - confige
asciinema: false
date: 2019-04-02 22:58:09
updated: 2019-04-02 22:58:09
---

vim对不同的文件类型有不同的语法高亮、格式、引用插件等功能。之前一直用vim写dockerfile都没发现dockerfile也有语法高亮，原因是vim没自动识别`dockerfile`类型文件。

<!-- more -->

{% asset_img 20190402_vim_no_set_ft.png %}
▲ vim不识别dockerfile文件类型

可以通过`:set filetype=dockerfile`在vim中指定文件的类型。

{% asset_img 20190402_vim_set_ft.png %}
▲ 通过`:set filetype=dockerfile`指定dockerfile文件类型

也可以在dockerfile文件头中加个注释`# vim: set filetype=dockerfile`，让vim识别，不过这个方法似乎有点问题，vim实际上并没有按我们预期的那样工作，文件类型识别为其他的类型了，原因不明，猜测是配置文件没正解链接加载到dockerfile文件类型。

{% asset_img 20190402_vim_set_ft_on_head.png %}
▲ 在文件头指定dockerfile文件类型

上面的两种方法都不是我想要的。第一，我肯定不会为一个语法高亮每次都手动的指定文件类型，第二，我不想在dockerfile添加和主题无关的内容。

下面这种“真自动识别”文件类型的方法才是我想要的。

``` vim
C. If your file type can be detected by the file name.
   1. Create your user runtime directory.  You would normally use the first
      item of the 'runtimepath' option.  Example for Unix: 
        :!mkdir ~/.vim

   2. Create a file that contains autocommands to detect the file type.
      Example: 
        " my filetype file
        if exists("did_load_filetypes")
          finish
        endif
        augroup filetypedetect
          au! BufRead,BufNewFile *.mine         setfiletype mine
          au! BufRead,BufNewFile *.xyz          setfiletype drawing
        augroup END
     Write this file as "filetype.vim" in your user runtime directory.  For
      example, for Unix: 
        :w ~/.vim/filetype.vim

  3. To use the new filetype detection you must restart Vim.

   Your filetype.vim will be sourced before the default FileType autocommands
   have been installed.  Your autocommands will match first, and the
   ":setfiletype" command will make sure that no other autocommands will set
   'filetype' after this.
```

方法是新建一个`~/.vim/filetype.vim`，内容如下：

```vim
if exists("did_load_filetypes")
	finish
endif
augroup filetypedetect
au! BufRead,BufNewFile dockerfile   setfiletype dockerfile
augroup END
```

这样，vim就可以自动的识别dockerfile文件的类型了。

## 参考

- <https://vimhelp.org/filetype.txt.html>

