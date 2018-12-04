---
layout: post
title: Extend space for LVM on virtualbox
categories:
  - linux
tags:
  - lvm
  - virtualbox
asciinema: true
date: 2018-12-04 18:40:15
updated: 2018-12-04 18:40:15
---

- [Knowledge induction of hard management](https://unihon.github.io/2018-12/knowledge-induction-of-disk-management/)

![](/2018-12/extend-space-for-lvm/20181204_befor.png)
▲ 原来的硬盘大小

虚拟机里要对LVM的进行扩容，在原来虚拟机硬盘空间不足的时候进行容量扩展。如是动态的虚拟硬盘，可以在后期对空间进行扩展，不过注意的是，动态虚拟硬盘的空间只能扩展，不能对其空间进行收缩。也可以重新创建一个虚拟硬盘，然后扩充到虚拟机上面。这里主要讲下对动态虚拟硬盘的空间进行扩展。

![](/2018-12/extend-space-for-lvm/20181204_modify.png)
▲ 对原来的动态vhd进行容量扩展

![](/2018-12/extend-space-for-lvm/20181204_after.png)
▲ 动态虚拟硬盘空间扩展后

<asciinema-player src="/2018-12/extend-space-for-lvm/20181204_disk.cast" poster="npt:0:5"></asciinema-player>
▲ 对LVM扩容
