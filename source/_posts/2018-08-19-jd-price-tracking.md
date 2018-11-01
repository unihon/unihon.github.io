---
layout: post
title: jd price tracking
date: 2018-08-19 22:48:03
updated: 2018-08-20 00:03:03
categories:
- python
tags:
- 爬虫
---

整理了下文件，看到一些以前弄的小东西，再拿来看下，也算是温习吧，不管什么，久了不用都很容易忘掉。  
这个是用来跟踪商品价格的一个小爬虫，爬的是jd的数据，因为自己网购基本在那上面...

下面堆上代码。

<!--more-->

```python
#引入所需要的模块，现在应该基本都直接用requests了吧，
#不过一些教程还是会从自带的urllib开始讲
import requests
import json
import re
import time
import os

def fun():

    #一个UA标识，证明下我是个人
    #因为不是高频爬虫，所以一个都够了，代理也免了
    userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36"

    #商品id
    itemId = '7234518'

    #jd的商品价格是动态生成的，直接加载的主页只有商品的名字什么的介绍，
    #所以F12把加载商品价格的文件找出来，分析下就行了
    postUrl="http://item.jd.com/"+itemId+".html"
    priceUrl="http://p.3.cn/prices/mgets?skuIds=J_"+itemId

    header = {
    "User-Agent": "userAgent"
    }

    #向服务器发送请求
    resName = requests.get( postUrl , headers = header)
    resPrice = requests.get( priceUrl , headers = header)

    htName = resName.text

    #正则匹配商品名称
    reName = re.search('"sku-name">(.*?)</',htName,re.S) 

    try:

        #group()提取的是正则匹配到的内容，group(n)则表示第n个捕获圆括号的内容，
        #如果group(x)，x又不存在则可能报错(AttributeError),
        #所以这里加个异常处理
        name = reName.group(1).strip()
    except AttributeError:
        print("no have this item")
        return

    #对于服务器返回json数据，一般中文都是经过ASCII编码处理的，可以更好的传输，
    #json数据，可以用json模块的loads()函数处理
    htPrice = json.loads(resPrice.text)
    price = str(htPrice[0]['p'])

    #time模块获取当时间
    itime = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())

    print('[time]\n')
    print(itime)
    print('-------------------------------')
    print('[name]\n')
    print(name)
    print('-------------------------------')
    print('[price]\n')

    #判断是否有货，无货时，价格小于0（一般为-1）
    if float(price) >= 0:
        print(price)
    else:
        print("no stock")
    print('-------------------------------')

    #文件名
    fileN = 'itemId_'+itemId+'.txt'

    #读取最近一次价格
    #os的popen()可以将shell执行的结果返回给变量，因为是对象数据，所以用read()读取
    lastP = os.popen("[ -f %s ] && tail -n 1 %s|cut -d, -f1"%(fileN,fileN)).read()

    #与上一次记录的价格比较，自定义事件
    if lastP == price+'\n':
        print('is same')
    elif lastP != '':
        print('is change')

    #将价格,日期写入文件
    #with open ... as ...
    #这种写法的好处是不用再手动close文件
    with open(fileN,'a+') as f:
     f.write(price+','+itime+'\n')

#判断是否是直接执行脚本身，而非其他脚本调用
if __name__ == "__main__":
    print("===============================")
    fun()
    print("===============================")
```

看下运行效果

```shell
[root@localhost xjd]#./xjd.py 
===============================
[time]

2018-08-19 23:30:07
-------------------------------
[name]

三星(SAMSUNG) 970 EVO 500G M.2 NVMe 固态硬盘（MZ-V7E500BW）
-------------------------------
[price]

1299.00
-------------------------------
is same
===============================
[root@localhost xjd]# cat itemId_7234518.txt 
1299.00,2018-08-19 22:07:39
1299.00,2018-08-19 23:30:07
[root@localhost xjd]# 

```

对于jd那个商品id，应该是比较固定的，这是长期跟踪价格的基础。  
最后可以用crontab定期运行脚本。

---

文件链接：[xjd.py](https://github.com/unihon/python_uni/tree/master/xjd)
