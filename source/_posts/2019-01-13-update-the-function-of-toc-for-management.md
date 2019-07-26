---
layout: post
title: update the function of toc for management
categories:
  - Web
tags:
  - Hexo
  - blog
asciinema: false
date: 2019-01-13 15:00:51
updated: 2019-01-13 15:00:51
---

因为management主题原有的目录功能有点“鸡肋”，所以花了点时间对其进行升级。

- [效果链接](https://unihon.github.io/2018-12/knowledge-induction-of-disk-management/)

<!-- more -->

![](/2019-01/update-the-function-of-toc-for-management/20190113_ori_pc.png)
▲ 原大屏端目录

![](/2019-01/update-the-function-of-toc-for-management/20190113_new_pc.png)
▲ 更新后大屏端目录

<img id="sm" src="/2019-01/update-the-function-of-toc-for-management/20190113_ori_m.jpg">
▲ 原小屏端目录

<img id="sm" src="/2019-01/update-the-function-of-toc-for-management/20190113_new_m.jpg">
▲ 更新后小屏端目录

---

js可以利用css的变量间接的控制像before、after这样的伪类。
``` css
//css

:root{
	--my-css-var: 'abc';
}
div::before{
	content: var(--my-css-var);
}

```
``` javaScript
//js

$(':root').css('--my-css-var','new var');

```
另外标签属性（样式，下同）在通过js重新设置后需要记录话，也可以借助css变量。  
比如有个标签T。

1. 首先在大屏端js改变T的属性（A）
2. 然后切换到小屏端，小屏端js也同样更新了T的属性（a）
3. 下次在小屏端切换回大屏端的时候A已经被a所覆盖

如果通过css变量保存A，再配合css的媒体查询，这样就可以在上面第3步小屏切换回大屏的时候，经过媒体查询从变量中取出A重新设置T的属性进行还原，小屏端也同理。这样无论两边怎么修改，都不会影响彼此。
