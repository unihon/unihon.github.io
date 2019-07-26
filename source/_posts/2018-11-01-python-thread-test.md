---
layout: post
title: python多线程同步测试
date: 2018-11-01 19:32:03
updated: 2018-11-01 19:32:03
categories:
- Python
tags:
- thread
---

一个python多线程的同步测试例子

<!-- more -->

``` python
#!/usr/bin/python3
import threading
import time

var=""
lock = threading.Lock()

class myThread(threading.Thread):
    def __init__(self,id,name):
        threading.Thread.__init__(self)
        self.id=id
        self.name=name
    def run(self):

        #引用全局变量，使不同线程的变量作用域相同
        global var
        print('[begin: '+self.name+']')

        for i in range(1,10):

            #获取锁
            #lock.acquire()
            try:
                #将当前的线程名赋值给var
                var='hello '+self.name

                #增加时延，提高变量单位时间内被不同线程交叉修改的概率
                time.sleep(0.1)
            finally:
                '''
                输出当前的线程id，和hell 线程名。目的是输出线程id与线程名是对应关系，
                不过var可能会在本线程将内容输出的前被其他线程修改，
                导致本线程最终输出的id和线程名不一致
                '''
                print('id:'+str(self.id)+'->'+var)

                #释放锁
                #lock.release()

        print('[end: '+self.name+']')

th1=myThread(1,'th1')
th2=myThread(2,'th2')

th1.start()
th2.start()

th1.join()
th2.join()

print('[exit py]')

```
在不开启线程锁时的执行结果。

``` shell
root@unihon ~/py/threadtest # ./mythread.py
[begin: th1]
[begin: th2]
id:1->hello th2
id:2->hello th2
id:2->hello th2
id:1->hello th2
id:1->hello th1
id:2->hello th1
id:1->hello th2
id:2->hello th1
id:1->hello th2
id:2->hello th2
id:1->hello th2
id:2->hello th2
id:1->hello th2
id:2->hello th2
id:1->hello th2
id:2->hello th2
id:1->hello th2
[end: th1]
id:2->hello th2
[end: th2]
[exit py]
root@unihon ~/py/threadtest #

```
可以看到，会有线程id和线程名不一致的情况。下面把脚本里的线程锁的注释取消，开启线程锁，再次执行脚本。

``` shell
root@unihon ~/py/threadtest # ./mythread.py
[begin: th1]
[begin: th2]
id:1->hello th1
id:1->hello th1
id:1->hello th1
id:1->hello th1
id:1->hello th1
id:1->hello th1
id:1->hello th1
id:1->hello th1
id:1->hello th1
[end: th1]
id:2->hello th2
id:2->hello th2
id:2->hello th2
id:2->hello th2
id:2->hello th2
id:2->hello th2
id:2->hello th2
id:2->hello th2
id:2->hello th2
[end: th2]
[exit py]

```
这下，所有的线程id和线程名都准确的对应上了，目的达成。  
注：这里整齐的线程分批输出，而不是各个线程混在一起，是因为循环太快了，在释放锁的瞬间又重新取得锁，以至于其他线程一直在等抢夺锁的机会。可以在循环开始时加个延时，减缓循环速度，就看到是各个线程混在一起输出了
