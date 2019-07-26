---
layout: post
title: boot loader grub
categories:
- Linux
tags:
- bootloader
- grub2
- uefi
asciinema: false
toc: true
date: 2019-01-13 20:00:53
updated: 2019-01-13 20:00:53
---

> 注：文章例子配置环境为UEFI-GPT

# boot loader基本功能
- 提供选单：用户可以选择不同的开机项目，这也是多重引导的重要功能；
- 载入核心文件：直接指向可开机的程序区段来开始操作系统；
- 转交其他 loader：将开机管理功能转交给其他 loader 负责。

# grub2
适用于BIOS和UEFI的启动加载器（boot loaders）。  
grub2支持两种方式引导操作系统
- 直接引导：(direct-load)直接通过默认的grub2 boot loader来引导写在默认配置文件中的操作系统
- 链式引导：(chain-load)使用默认grub2 boot loader链式引导另一个boot loader，该boot loader将引导对应的操作系统

一般只使用第一种方式，只有想引导grub默认不支持的操作系统时才会使用第二种方式。

# 设置引导

## 基本流程
配置文件和grub命令行基本一样
1. set root=(hd0,1)  
(hd0,1)为boot的硬盘和分区，这个一定要对，grub2的硬盘从0开始算，分区从1开始算，注意的是，硬盘的顺序可能会改变，如在主机添加或移去一个硬盘（设备）的时候。

2. linux /vmlinuz-linux root=/dev/sda2 rw quiet  
vmlinuz-linux为内核文件，vm代表虚拟内存，z代表压缩过。  
这里的root指的是内核的linux的根目录的硬盘-分区，也就是平时的linux的根目录的硬盘-分区，可以用/dev/sda2表示，也可以用root=UUID=xxx（该分区的UUID）表示。这个root必须指明，不然会在系统启动时出错，如提示先加载内核什么的。

	linux命令除了root还有其他的一些“内核参数”
``` bash
init=	：指定Linux启动的第一个进程init的替代程序。
root=	：指定根文件系统所在分区，在grub中，该选项必须给定。
ro,rw	：启动时，根分区以只读还是可读写方式挂载。不指定时默认为ro。
initrd	：指定init ramdisk的路径。在grub中因为使用了initrd或initrd16命令，所以不需要指定该启动参数。
rhgb	：以图形界面方式启动系统。
quiet	：以文本方式启动系统，且禁止输出大多数的log message。
net.ifnames=0	：用于CentOS 7，禁止网络设备使用一致性命名方式。
biosdevname=0	：用于CentOS 7，也是禁止网络设备采用一致性命名方式。
只有net.ifnames和biosdevname同时设置为0时，才能完全禁止一致性命名，得到eth0-N的设备名。

```

3. Initrd /initramfs-linux.img  
这个文件用来加载各种模块

4. boot  
因为配置文件在末尾会隐性加上boot，所以配置文件可以不写。

## root变量 
一般root变量表示/boot所在的分区，但这不是绝对的，如果设置为根文件系统所在分区，如root=(hd0,gpt2)，则后续可以使用/etc/fstab来引用"(hd0,gpt2)/etc/fstab"文件。
假设boot所在的硬盘-分区为(hd0,1)

- 如果boot不是一个独立的分区
/boot/file-->(/)/boot/file-->(hd0,1)/boot/file
grub里面访问文件的路径为(hd0,1)/boot/file
- 如果boot是一个独立的分区
/boot/file-->(/boot)/file-->(hd0,1)/file
因为boot分区为grub的根目录，所以(hd0,1)表示的是就是boot/，所以在grub里面路径的形式为(hd0,1)/file而不是(hd0,1)/boot/file

在定义了root变量之后，后续就可以直接用/dir/file的形式表示(hd0,1)/dir/file。其中grub里面绝对路径的形式为(hd0,1)/dir/file，相对路径的形式为/dir/file，这个linux里的定义有点区别。

## ls
列出文件（夹）、设备  

## Chainloader
链加载，加载当前分区启动或者从文件启动，可直接启动efi文件。ChainLoading的意思是用当前的bootloader去载入另一个bootloader,所以叫做链式加载.这个bootloader可能位于MBR,也可能在另一个分区的引导扇区上。
1. chainloader +1   
此处'+1'是指示GRUB读入分区的第一个扇区的引导记录。  
这个可能会提示说”找不到EFI的路径“，不知道为什么这里的EFI“变小写了“（大写的文件（夹）名全变小写），在设置root变量后，(/boot/efi)/EFI/xx，原本应该这样访问-->/EFI/xx，但正确的访问方式是-->/efi/xx或者(hd1,1)/efi/xx。

<img id="sm" src="/2019-01/boot-loader-grub/20190113_esp.png">
▲ ESP信息

<img id="sm" src="/2019-01/boot-loader-grub/20190113_grub.png">
▲ grub shell下ESP里面的文件路径情况

初步判定和fat32的长文件名、短文件名或mount sortename的参数有关。如果是通过mount挂载的话，可以设置sortename，不过grub那里的设备挂载目前没能找到与之相关的设置。

2. chainloader (hd1,1)/efi/grub/boot.efi  
直接从文件启动，如果指定root变量可以用相对路径

## lsmod
列出所有模块

## insmod 
加载某个模块

## prefix变量
设置grub模块和配置文件的路径

## probe
探测分区或磁盘的属性信息。如果未指定--set，则显示指定设备对应的信息。如果指定了--set，则将对应信息的值赋给变量var。 

``` bash
probe [--set var] --partmap|--fs|--fs-uuid|--label device 
--partmap：显示是gpt还是mbr格式的磁盘。
--fs：显示分区的文件系统。
--fs-uuid：显示分区的uuid值。
--label：显示分区的label值。

```

# os-prober自动扫描系统添加引导
安装os-prober后，可以将安装了其他系统的硬盘（分区）挂载，然后再重新生成grub.cfg文件，他会自动扫描并添加引导条目到启动菜单，其中有两种情况。
1. 如果挂载的是其他系统的/boot分区（目录），那么扫描到是将是这个系统的bootloader，菜单添加的内容是“转交bootloader控制权”的条目，这样的引导形式为链式引导
2. 如果挂载的是其他系统的/根分区（目录），那么扫描到是将是这个系统的核心，菜单添加的内容是“加载这个系统核心”的条目，这样的引导形式为直接引导

个人建议将整个系统进行挂载，然后扫描。

# 参考
- [https://wiki.archlinux.org/index.php/Installation_guide ](https://wiki.archlinux.org/index.php/Installation_guide)
- [https://wiki.archlinux.org/index.php/EFI_system_partition ](https://wiki.archlinux.org/index.php/EFI_system_partition)
- 鸟哥的Linux私房菜-基础篇（第四版）
