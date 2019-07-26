---
layout: post
title: 记mariadb导入csv数据错位问题
date: 2018-10-04 18:21:32
updated: 2018-10-04 18:21:32
categories:
- Database
tags:
- SQL
- csv
---

今早上将xlsx文件导出为csv文件，用sql导入到数据库中间遇到的一点问题。

<!-- more -->

<img id="sm" src="/2018-10/db-value-question/201810041.png">
▲ 结果如图

从这错乱可以直观的看出（打印内容过多也可能错乱），应该是哪里出问题了。表是自己设计的，可以排除不是编码和字段长度不够引起的。

<img id="sm" src="/2018-10/db-value-question/201810042.png">
▲ 查看id字段

<img id="sm" src="/2018-10/db-value-question/201810043.png">
▲ 查看speciality字段

从结果可以看出，问题应该在speciality字段上面。后面我接着重新导了一份csv数据，结果一样。着实是想不到问题出在哪里。疑问为什么id好好的，有中文那个字段就乱七八糟了，不应该是编码问题啊？接着尝试性的将表备份出来，看下。

![](/2018-10/db-value-question/201810044.png)
▲ 查看备份数据

这下清楚了，每行数据后面多了`\r`，这个应该是windows下面的换行符。知道问题之后，就好解决了。

<img id="sm" src="/2018-10/db-value-question/201810045.png">
▲ 以二进制方式打开csv文件

可以看到`^M`结尾的换行符，这个就是要找要的`\r`，全部删除掉就好了，至于文件开头的`<feff>`说是`utf-8`标识相关的，先不理。

`vim`下面有两个方法（可能还有其他的）批量把`\r`给删除掉，用的都是替换：  

```shell
:%s/\r//g
:%s/^M//g  #这里的^M不是直接打出来，用ctrl+v ctrl+m 

```

如果是对文件进行批量处理，可以将文件集中到一个目录下，接着用下面的命令：  

```shell
ls|xargs sed -i 's/\r//g'

```

<img id="sm" src="/2018-10/db-value-question/201810046.png">
▲ 删除`\r`换行符后，重新导入

解决。
