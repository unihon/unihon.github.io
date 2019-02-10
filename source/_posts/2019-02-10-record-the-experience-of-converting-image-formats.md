---
layout: post
title: record-the-experience-of-converting-image-formats
categories:
  - python
tags:
  - picture
  - formats
  - automation
asciinema: false
date: 2019-02-10 11:14:27
updated: 2019-02-10 11:14:27
---

因有一批CR2格式（RAW）的图片需要转换为jpg格式。因为电脑上没有安装相关的软件，所有就计划利用现有的“开发环境”来自己写一个格式转换的脚本进行自动的批量转换。

首先想到的就是python，经过一番搜索，决定先试下PIL（Python Image Library）这个图像处理库。
PIL目前还未有python3的版本，PIL相关下载请参阅[PIL下载页面](http://pythonware.com/products/pil/)

![](/2019-02/record-the-experience-of-converting-image-formats/20190210_pil_down_page.png)
▲ PIL下载页面

现在有个叫Pillow（号称friendly fork for PIL，下文简称PIL）移植版本，功能据说是和PIL基本一样，不过它支持python3，请参阅[Pillow文档](https://pillow.readthedocs.io/en/stable/index.html)。

安装Pillow

``` bash
$ pip install pillow
```

一个测试脚本，打开CR2格式的图片，打印图片信息并以jpg格式保存图片。

``` bash
from PIL import Image
# 打开图像文件
pic = "bb.CR2"
img = Image.open(pic)
print(img)
# 以jpg格式保存:
img.save('new.jpg', 'jpeg')
```

执行脚本，报错了，`OSError: cannot identify image file 'xx.CR2'`。

![](/2019-02/record-the-experience-of-converting-image-formats/20190210_pil_cr2.png)
▲ PIL打开CR2文件报错

后面多次尝试结果都一样，于是便用一个jpg文件测试一下，结果是可以正常执行的。

![](/2019-02/record-the-experience-of-converting-image-formats/20190210_pil_jpg.png)
▲ PIL正常打开jpg文件

于是猜想会不会是PIL不支持CR2（RAW）格式的图片，查阅了下相关资料，并未发现CR2，请参阅[PIL所支持的格式列表](https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html)。

利用PIL将CR2文件转换为jpg文件的方法到此结束。

接着我找到了一个可以处理RAW文件的rawkit库，[rawkit主页](https://rawkit.readthedocs.io/en/v0.6.0/index.html)。

这样利用rawkit就可以读取CR2格式图片，不过rawkit主要功能是对RAW文件数据的调整，并没有提供格式转换的功能。
不过前面提到的PIL库中的`frombytes`模块可以将图片数据生成图片文件（官方解释：**Creates a copy of an image memory from pixel data in a buffer.**），请参阅[PIL.Image.formbytes](https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.frombytes)。不过中间还需要利用`numpy`库，对读取出来的RAW文件的数据进行一些处理。

大概流程：

1. 利用rawkit打开RAW文件
2. 可以利用rawkit对RAW文件的数据对图片效果进行一些调整（可选）
3. 利用numpy处理RAW文件数据
4. 利用PIL将相关数据生成图片文件数据（内存）
5. 利用PIL将内存中的图片数据保存为指定格式的图片文件

经测试，方法可行，于是整理脚本，对CR2文件进行批量的格式转换。

``` python
import os
import re
import numpy as np
from rawkit.raw import Raw
from rawkit.options import WhiteBalance, colorspaces, gamma_curves, highlight_modes
from PIL import Image

fils = os.listdir("/root/CR2_dir/")
source = "/root/CR2_dir/"
target = "/root/JPG_dir/"

for fina in fils:
    print(target+re.sub(r'.CR2',".jpg",fina))

    raw_image = Raw(source+fina)

    # 下面对RAW数据的调整是后面加上的
    # raw_image.options.white_balance = WhiteBalance(camera=False,auto=True)
    # raw_image.options.colorspace = colorspaces.adobe_rgb
    # raw_image.options.gamma = gamma_curves.adobe_rgb
    # raw_image.options.highlight_mode = highlight_modes.blend
    # raw_image.options.highlight_mode = highlight_modes.reconstruct

    buffered_image = np.array(raw_image.to_buffer())

    image = Image.frombytes('RGB', (raw_image.metadata.width, raw_image.metadata.height), buffered_image)
    image.save(target+re.sub(r'.CR2',".jpg",fina))

print("---------------[END]------------------")
```

运行脚本。

![](/2019-02/record-the-experience-of-converting-image-formats/20190210_pil_rawkit.png)
▲ 利用rawkit-numpy-PIL批量转换CR2文件格式

不过，最后查看转换后的图片时，却发现了一个奇怪的问题。

![](/2019-02/record-the-experience-of-converting-image-formats/20190210_cr2_jpg.png)
▲ 转换的jpg比原CR2的亮度要低

转换格式后的图片的样式变了，我想应该是RAW文件数据处理的问题，便参考rawkit的文档，调整了几个数据，虽然有些许变化，不过都没能达到原CR2文件预览的效果。

当下我还不想成为一个“图片数据、参数专家”，所以利用rawkit-numpy-PIL这个组合的方法，到此结束。

不过，在上面所说的这些方法之前，已经发现Windows 10上面的`照片`自带有一个“保存副本”的功能，利用这个可以将CR2文件保存为jpg格式，而且转换后的图片和CR2预览的效果基本一样。

![](/2019-02/record-the-experience-of-converting-image-formats/20190210_win_pic.png)
▲ 利用Windows 10的`照片`“保存副本”转换图片格式

于是乎，我又打算从这里入手。当然，因为图片的数量问题，是不可能一个一个的手动操作进行转换的。好在可以利用python进行一个点击、按键的模拟。这样可以写一个“自动化”的脚本，让电脑替代人工来完成这类大量的简单重复操作。

python在Windows上面要实现点击之类的模拟，需要pywin32库，利用它，python可以调用一些Windows上面的接口。请参阅[pywin32的Github](https://github.com/mhammond/pywin32)。

可以将保存副本的操作步骤都记录下来，知道每次点击的像素位置，然后用python的模拟点击进行自动批量操作。因为Windows 10上面的`照片`刚好支持快捷键，所用这里用更简单的模拟按键的方法。

``` python
import time
import win32api,win32gui,win32con

VK_CODE = {
    'ctrl':0x11,
    'right_arrow':0x27,
    'enter':0x0D,
    'e':0x45,
    's':0x53,
    }

def sendKeys(a,b,t):
    win32api.keybd_event(VK_CODE[a], 0, 0, 0)
    win32api.keybd_event(VK_CODE[b], 0, 0, 0)
    time.sleep(t)
    win32api.keybd_event(VK_CODE[a], 0, win32con.KEYEVENTF_KEYUP, 0)
    win32api.keybd_event(VK_CODE[b], 0, win32con.KEYEVENTF_KEYUP, 0)

def sendKey(a):
    win32api.keybd_event(VK_CODE[a], 0, 0, 0)
    win32api.keybd_event(VK_CODE[a], 0, win32con.KEYEVENTF_KEYUP, 0)

def dokey():
    sendKeys("ctrl","e",0.1)
    time.sleep(1)
    sendKeys("ctrl","s",0.1)
    time.sleep(1.5)
    sendKey("enter")
    time.sleep(3.5)
    sendKey("right_arrow")

try:
    total = int(input("input total picture: "))
except:
    print("please a number.")
    exit();

for i in range(0,total):
    time.sleep(1)
    print("["+str(i+1)+"/"+str(total)+"]")
    dokey()

print("----------------[END]--------------------")
```

![](/2019-02/record-the-experience-of-converting-image-formats/20190210_pywin.gif)
▲ 模拟按键“自动操作”

利用这类方法的缺点就是，需要自己根据实际调整每个步骤的时间间隔，还有在执行时，电脑不能用来做其他的事情。

最后总结，如果不是特别需求，最省事的方法是直接用专门的格式转换工具进行处理。
