---
layout: post
title: add asciinema player to the hexo(maupassant theme) 
categories:
- Web
tags:
- asciinema
- Hexo
asciinema: true
date: 2018-12-02 20:24:41
updated: 2018-12-02 20:24:41
---

- [asciinema player 官网](https://asciinema.org/)
- [asciinema player 文档](https://asciinema.org/docs/how-it-works)
- [asciinema player Github](https://github.com/asciinema/asciinema-player)
- [asciinema player web 播放器](https://github.com/asciinema/asciinema-player/releases)

在主机安装好asciinema就可以直接用，因为是保存本地，所有没必要去注册一个账号。

``` shell
asciinema rec filename.cast

```

这样就可以将录屏直接保存到本地，文件后缀可以是cast、json，注意的是hexo用json格式有问题（也可能是maupassant主题的原因）

** 下面将asciinema加到hexo，这里用的是maupassant主题，其他主题大同小异 **

[hexo 主题的内容](https://hexo.io/zh-cn/docs/themes)

<img id="sm" src="/2018-12/add-asciinema-player-to-the-hexo/20121202_tree.png">
▲ maupassant主题结构

`themes/maupassant/sources/`文件夹里面就是静态文件的内容，将下载好的asciinema player播放器的js和css文件放到这里面

分析可以知道maupassant主题的`页面模板的头`是`layout/_partial/head.pug`，对应的引入js的页面模板是`layout/_partial/footer.pug`

![](/2018-12/add-asciinema-player-to-the-hexo/20121202_code.png)
▲ 在模板头、尾分别引入播放器的css和js

这里我加了一个是否启用asciinema player播放器的开关`if page.asciinema == true`（[hexo 变量的内容](https://hexo.io/zh-cn/docs/variables)），因为一般不会有非常多的文章都用到这个播放器，如果每个页面、文章都加载就有点多余了。  
MD头如下，在asciinema为true时就启用播放器。

``` md
---
layout: post
title: add asciinema player to the hexo(maupassant theme) 
categories:
- Web
tags:
- asciinema
- Hexo
asciinema: true
date: 2018-12-02 20:24:41
updated: 2018-12-02 20:24:41
---

```

这样，全部工作就完成了，在md里插入播放器就直接用官网的方法

``` html
<asciinema-player src="/xxx/file.cast"></asciinema-player>

```

<asciinema-player src="/2018-12/add-asciinema-player-to-the-hexo/first.cast" poster="npt:0:5"></asciinema-player>
▲ 成品

其实有点悲伤，开始想给自己的hexo加入asciinema，就直接动手改现在的主题了，在我弄完之后，才回想起hexo插件这回事，然后马上上去查了下，还真有，心凉~

![](/2018-12/add-asciinema-player-to-the-hexo/20121202_hexo.png)
▲ hexo官网上的asciinema插件
