---
layout: post
title: Knowledge induction of hard management 
categories:
  - linux
tags:
  - partition
  - lvm
asciinema: false
toc: true
date: 2018-12-02 23:21:32
updated:
---

# 基础概念

- MBR最多只能分4个主分区，可以用一个扩展分区代替一个主分区，扩展分区可以分出多个逻辑分区
- GPT全是主分区，没扩展分区说法
- 分区要格式化（分配对应的文件系统xfs、extn）后才能使用
- cat /proc/partitions，查看系统支持的文件系统
- /etc/mtab，实时挂载文件（mount命令），只读
- /etc/fstab，开机挂载文件

<!-- more -->

## 相关命令

- lsblk
``` shell
选项与参数：

-d ：仅列出磁盘本身，并不会列出该磁盘的分区数据 
-f ：同时列出该磁盘内的文件系统名称 
-i ：使用 ASCII 的线段输出，不要使用复杂的编码 (再某些环境下很有用)
-m ：同时输出该装置在 /dev 底下的权限数据 (rwx 的数据) 
-p ：列出该装置的完整文件名！而不是仅列出最后的名字而已。 
-t ：列出该磁盘装置的详细数据，包括磁盘队列机制、预读写的数据量大小等

仅列出 /dev/vda 装置内的所有数据的完整文件名
lsblk -ip /dev/vda
```

- blkid找出装置的UUID
- parted列出磁盘的分区表类型与分区信息  
parted /dev/vda print

## 磁盘分区工具

- MBR（msdos） 分区表请使用 fdisk 分区
- GPT 分区表请 使用 gdisk 分区
- parted用于GPT分区表
- partprobe  
利用这个可以不重启就可以更新Linux核心的分区表信息，`partprobe -s`输出信息

## mkfs.tag：格式化分区

- tag为相应的文件系统，如xfs
- 如果在删除一个已经格式化过的分区，并接着新创建一个分区，那么这个分区可能还保留着之前分区的文件系统，可以加入-f选项覆盖

## 创建分区基本步骤

1. 透过lsblk或blkid先找到磁盘
2. 用parted /dev/xxx print或者fdisk、gdisk等工具来找出内部的分区表类型
3. 之后再用gdisk、fdisk等分区工具来操作
4. 最后用mkfs格式化分区（有时可选，如扩展分区的时候）

# LVM

LVM是Linux环境中对磁盘分区进行管理的一种机制，是建立在硬盘和分区之上、文件系统之下的一个逻辑层，可提高磁盘分区管理的灵活性。RHEL5默认安装的分区格式就是LVM逻辑卷的格式，需要注意的是/boot分区不能基于LVM创建，必须独立出来。

![](/2018-12/knowledge-induction-of-disk-management/20181203_lvm.png)
▲ LVM组成图

LVM的灵活性很高，LV容量不够的时候，可以不对该LV的分区的容量重新次分配，可以在硬盘上新增加一个分区，利用这个新分区创建PV，将新建的PV扩展到要扩展容量的LV同一个VG，这样这个VG的PE数量就增加了，最后就可以利用这些PE给LV扩展容量。整个过程对LV原有的数据是无损的。

![](/2018-12/knowledge-induction-of-disk-management/20181203_relation.png)
▲ LVM相关元素

![](/2018-12/knowledge-induction-of-disk-management/20181203_command.png)
▲ LVM相关操作命令

## 创建LVM基本步骤

1. 硬盘分区
2. 利用硬盘分区创建PV
3. 利用PV创建（归入）VG
4. 创建LV（来自同一个VG的PE才能生成LV）
5. 格式化LV分区
6. MOUNT分区

# 重新分配分区

主要有两种情况，一种是不用LVM的传统分区，另一个则是用LVM的分区。  
主要以扩容为主，缩容为扩容的的逆过程。

## 传统分区的重分配

传统的分区（不用LVM），对一个分区的容量重新分配往往是比较麻烦的，而且限制很多。想对一个分区在保留原数据的情况下重新分配，就得删除该分区并重新创建一个分区，新分配的分区的开始磁柱号码必须和原分区的磁柱号码一致。这就意味这只有在硬盘最后面的一个分区能够进行保留原数据的重新分配，如果是一个在中间的分区，就必定会影响到该中间分区后面的分区（如果重新分配的大小比原来大小，原理上说不会影响到后面的分区）。

###  相关命令 

- e2fsck
e2fsck是检查ext2、ext3、ext4等文件系统的正确性。  
-f : 强制检查
- resize2fs  
resize2fs - ext2/ext3/ext4文件系统重定义大小工具。  
-f：强制执行调整大小操作，覆盖掉安全检查操作;  
-p：打印已完成的百分比进度条;
- xfs_growfs  
xfs_growfs - xfs_growfs文件系统重定义大小工具。  

>xfs文件系统，只能对分区进行扩容，不能缩容

### 步骤  

1. 使用分区管理工具（fdisk、gdisk等）删除要重新分配的分区  
2. 紧接着新创建一个为目标容量的分区，确保新的分区开始的磁柱号码和原分区的开始磁柱号码一样  
3. 使用partprobe更新Linux核心的分区表信息  
4. 调整后的分区不需要重新格式化  
5. extn文件系统  
5.1 使用e2fsck对调整后的分区进行检查  
5.2 使用resize2fs对文件系统重定义大小  
6. xfs文件系统  
6.1 使用xfs_growfs对文件系统重定义大小  

## LVM分区的重分配

对LVM重分配，最终目的就是改变LV容量，LV的容量由VG的PE数量决定（下面主要是扩容）

### LVM分区重分配的几种方法 


- 如果LV对应VG还有PE剩余可用，可以直接利用这部分PE对LV进行扩容
	1. lvextend、lvresize分配LV容量
	2. 用resize2fs、xfs_growf调整LV数据
- 另外再创建一个新的分区，利用该分区创建PV并扩展到对应的VG，将新的PE对LV进行扩容
	1. pvcreate /dev/sda2
	2. vgextend 目标VG /dev/sda2
	3. lvextend、lvresize分配LV容量
	4. 用resize2fs、xfs_growf调整LV数据
- 直接将LV对应的VG上面的PV进行扩容，也就是对已经在使用的分区进行扩容（和普通分区扩容一样,局限性和也普通分区扩容一样，不推荐）
	1. 删除原分区，接着新创建一个分区，之后不用格式化
	2. pvresize /dev/sda2 重新分配PV大小
	3. lvextend、lvresize分配LV容量
	4. 用resize2fs、xfs_growf调整LV数据
