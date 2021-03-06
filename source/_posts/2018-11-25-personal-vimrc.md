---
layout: post
title: personal-vimrc
date: 2018-11-25 20:40:51
updated: 2019-06-07 10:12:56
categories:
- Config
tags:
- Vim
---

Personal vimrc

<!-- more -->

``` vim
set encoding=utf8

colorscheme elflord
syntax enable

set number
set numberwidth=2
highlight CursorLineNr ctermfg=3

set cursorline
set hlsearch
set cmdheight=1
set wildmenu

set tabstop=4
set softtabstop=4
set shiftwidth=4

set backspace=2
set updatetime=100

" tab map key
nmap <F5> :tabfirst<CR>
nmap <F6> :tablast<CR>
nmap <F7> :tabprevious<CR>
nmap <F8> :tabnext<CR>

" windows size control map key
nmap <F9> :vertical resize +2<CR>
nmap <F10> :vertical resize -2<CR>
nmap <F11> :resize +2<CR>
nmap <F12> :resize -2<CR>

nmap <leader>z gg=G<C-o><C-o>
nmap <leader>j :%!python -m json.tool

" StatusLine and TabLine
" ------------------------------------------------
" StatusLine
set laststatus=2
set statusline=%f\ %#CgMf#%m%*%=%y\ %{&fileencoding!=''?'['.&fileencoding.']':''}\ %{'['.&fileformat.']'}\ %10(%l,%c%)\ =%L\ %P

" TabLine
set showtabline=2

function MyTabLine()
	let s = ''
	for i in range(tabpagenr('$'))
		if i + 1 == tabpagenr()
			let s .= '%#TabLineSel#'
		else
			let s .= '%#TabLine#'
		endif

		let s .= ' (' . tabpagewinnr((i + 1),'$') . ')'
		let s .= ' %{MyTabLabel(' . (i + 1) . ')} '
	endfor

	let s .= '%#TabLineFill#'
	let s .= "%=[%{tabpagenr()}/%{tabpagenr('$')}]"

	return s
endfunction

function MyTabLabel(n)
	let buflist = tabpagebuflist(a:n)
	let winnr = tabpagewinnr(a:n)
	return pathshorten(bufname(buflist[winnr - 1]))
endfunction

set tabline=%!MyTabLine()

" StatusLine and TabLine highlight
if &t_Co > 8 
	" 16 or 256 color
	"
	" StatusLine
	highlight StatusLine cterm=bold ctermfg=0 ctermbg=10
	highlight StatusLineNc cterm=NONE ctermfg=0 ctermbg=7
	highlight CgMf cterm=bold ctermfg=0 ctermbg=11
	" TabLine
	highlight TabLineSel cterm=bold ctermfg=0 ctermbg=10
	highlight TabLine cterm=NONE ctermfg=7 ctermbg=8
	highlight TabLineFill cterm=bold ctermfg=0 ctermbg=7
else
	" 8 color
	"
	" StatusLine
	highlight StatusLine cterm=NONE ctermfg=0 ctermbg=2
	highlight StatusLineNc cterm=NONE ctermfg=0 ctermbg=7
	highlight CgMf cterm=NONE ctermfg=0 ctermbg=3
	" TabLine
	highlight TabLineSel cterm=NONE ctermfg=0 ctermbg=2
	highlight TabLine cterm=NONE ctermfg=0 ctermbg=7
	highlight TabLineFill cterm=NONE ctermfg=0 ctermbg=7
endif


" list of plugins
" ------------------------------------------------
call plug#begin('~/.vim/plugged')
" basic
"
" 文件资源树
Plug 'scrooloose/nerdtree'
" 注释
Plug 'tpope/vim-commentary'
" 符号成对补全
Plug 'jiangmiao/auto-pairs'

" develop
"
" 文件git状态
Plug 'airblade/vim-gitgutter'
" html快速编写
Plug 'mattn/emmet-vim'
" js高亮及格式化
Plug 'pangloss/vim-javascript'
call plug#end()
" ------------------------------------------------

" plugin options
" ------------------------------------------------
" scrooloose/nerdtree
nmap <F3> :NERDTreeToggle<CR>

" airblade/vim-gitgutter
let g:gitgutter_sign_removed_first_line = '^'

highlight GitGutterAdd ctermfg=2
highlight GitGutterChange ctermfg=3
highlight GitGutterDelete ctermfg=1
```
