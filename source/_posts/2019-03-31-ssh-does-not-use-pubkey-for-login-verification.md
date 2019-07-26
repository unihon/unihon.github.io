---
layout: post
title: ssh-does-not-use-pubkey-for-login-verification
categories:
  - Linux
tags:
  - ssh
  - command
asciinema: false
date: 2019-03-31 21:42:06
updated: 2019-03-31 21:42:06
---

虽然ssh利用密钥对进行登录验证很方便，也比手动输入的密码验证要安全，不过有时会需要针对某个主机不使用密钥对进行验证。

<!-- more -->

**EnableSSHKeysign**

Setting this option to yes in the global client configuration file /etc/ssh/ssh_config enables the use of the helper program ssh-keysign(8) during HostbasedAuthentication. The argument must be yes or no (the default). This option should be placed in the non-hostspecific section. See ssh-keysign(8) for more information.

当设置`EnableSSHKeysign`值为`no`时便禁用了密钥对的验证方式。可以在相关的配置文件进行“全局、永久性”的设置，也可以通过ssh命令的`-o`参数临时性的设置。


{% asset_img 20190331_ssh_login.gif %}
▲ 在ssh命令行中针对某主机临时性设置不使用密钥对验证

## 参考

- <https://man.openbsd.org/ssh_config>
- <https://man.openbsd.org/ssh>
