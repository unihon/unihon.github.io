---
layout: post
title: the problem of bootloader with uefi on virtualbox6
categories:
  - linux
tags:
  - virtualbox
  - uefi
  - bootloader
  - grub2
asciinema: false
date: 2019-01-16 21:14:09
updated: 2019-03-17 19:44:53
---

本来在virtualbox5.2上面的通过UEFI引导的系统，在vb升级到6.0之后，出现的一个“诡异问题”。因为各种原因，我是直接将备份虚拟机的虚拟硬盘（VHD等）导入到vb6中，可能通过vb软件的直接升级不会有这个情况（具体没做测试）。

<!-- more -->

问题是这样的，在虚拟机系统开机的时候bootloader（grub等）的画面不显示，等待片刻后（应该是bootloader的等待时间到了）就直接进入系统了，也就是没有出现“引导菜单”的画面。其实在此之前恰逢我新建了一个虚拟机，就在给系统安装bootloader并调试的时候就“一头扎进这巨坑”了。明明该配的都已经配置好了，为什么还是没bootloader的画面。中间也用了一个debian的liveCD做测试，同样不能显示bootloader的画面。其中有个虚拟机是用传统BIOS启动的，然而那个就正常加载bootloader的画面。

在通过搜索各种网上资源都没解决后，我都开始怀疑这会不会是个bug...

![](/2019-01/the-problem-of-bootloader-with-uefi-on-virtualbox6/20190116_bl_no.gif)
▲ 系统在开机后不显示bootloader画面直接进入系统

virtualbox 6.0默认的图形驱动是VMSVGA，如果是传统BIOS启动的话，这个模式是可以正常显示bootloader的画面的，不过如果是以UEFI启动的话，VMSVGA模式是不能显示bootloader的画面的！除了VMSVGA之外，还有VBoxVGA、VBoxSVGA。其中只有VBoxVGA模式才能在以UEFI方式启动的时候正常显示bootloader的画面。

![](/2019-01/the-problem-of-bootloader-with-uefi-on-virtualbox6/20190116_vb_setting.png)
▲ 虚拟机的显示模式设置

![](/2019-01/the-problem-of-bootloader-with-uefi-on-virtualbox6/20190116_bl_yes.gif)
▲ 设置为VBoxVGA模式后系统开机正常显示bootloader画面

后面在6.0.4的更新日志中可以看到，有一条“EFI增加VMSVGA图形驱动的支持”的条目，可见在6.0.4之前，VMSVGA是不支持EFI的，这也就解释了为什么前面的6.0在使用UEFI启动系统时不显示“引导菜单”的画面。后面经测试在virtualbox 6.0.4版本，在使用UEFI启动系统并使用默认的图形驱动，也就是VMSVGA，确实可以显示“引导菜单”的画面，不过另一个图形驱动VBoxSVGA目前还是没有支持EFI。

> Version 6.0.4 (2019-01-28)  
This is a maintenance release. The following items were fixed and/or added:  
Virtualization core: support Shanghai/Zhaoxin CPUs.  
- User interface: handle command line arguments to VirtualBox correctly (bugs #18206 and #18197)
- User interface: improvements to machine manager window, virtual optical disk creator, storage selector window and log viewer window
- User interface: various small fixes and improvements
- Audio: implemented time scheduling for the AC'97 device emulation to keep audio and video in sync
- **Graphics: basic support for VMSVGA graphics device in virtual machines using EFI**
- Network: fix occasional NATNet crashes (bug #13899)
- Network: worked around problems in certain PCnet drivers on old operating systems
- Serial: fixed connecting to pseudo terminals on POSIX hosts (6.0.0 regression; bug #18319)
- Linux hosts and guests: fix for building kernel modules against Linux 5.0. Thank you Kyle Laker
