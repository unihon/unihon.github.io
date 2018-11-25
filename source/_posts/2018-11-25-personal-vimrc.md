---
layout: post
title: personal-vimrc
date: 2018-11-25 20:40:51
updated: 2018-11-25 20:40:51
categories:
- config
tags:
- vim
---

Personal vimrc

<!-- more -->

``` shell
set encoding=utf8

nmap <F3> :NERDTreeMirror<CR>
nmap <F3> :NERDTreeToggle<CR>

nmap <F5> :tabfirst<CR>
nmap <F6> :tablast<CR>
nmap <F7> :tabp<CR>
nmap <F8> :tabn<CR>

nmap <F9> :vert res +2<CR>
nmap <F10> :vert res -2<CR>
nmap <F11> :res +2<CR>
nmap <F12> :res -2<CR>

nmap <leader>z gg=G <C-o><C-o>

set tabstop=4
set softtabstop=4
set shiftwidth=4

set backspace=2

set nu
set hls
set cul

syntax enable
colorscheme elflord
set cmdheight=1

" 插件
" ================================================
call plug#begin('~/.vim/plugged')
" 资源树
Plug 'scrooloose/nerdtree'
" 括号补全
Plug 'jiangmiao/auto-pairs'
" 代码注释
Plug 'tpope/vim-commentary'
call plug#end()"
" ================================================

```