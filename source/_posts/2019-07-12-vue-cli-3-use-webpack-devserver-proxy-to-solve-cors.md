---
layout: post
title: vue-cli-3-use-webpack-devserver-proxy-to-solve-cors
categories:
  - web
tags:
  - Vue
  - webpack
  - CORS
asciinema: false
date: 2019-07-12 14:31:31
updated: 2019-07-12 14:31:31
---

使用 Vue Cli 配置 webpack devServer 代理，解决跨域问题。

<!-- more -->

对于开发、测试期间，解决跨域问题有几个比较方便方法。

- 配置浏览器，添加浏览器的启动选项 `--disable-web-security --user-data-dir` 使其允许跨域
- 配置相关的开发工具，如 webpack devServer

如果使用 Vue Cli 3.x，配置和之前的版本有些区别。其配置文件为项目 root 目录下的 `vue.config.js`，可以直接在 Vue Cli 的配置文件中对 webpack devServer 进行配置，Vue Cli 最终会将这部分配置应用到 webpack devServer。除此，原理上说，也可以直接使用 webpack 的配置文件 `webpack.config.js` 对 webpack devServer 进行配置。不过为了统一性，这里是在 Vue Cli 的配置文件进行配置。

> vue-config.js

``` JavaScript
module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target:'http://api.com:8000',
                changeOrigin: true,
                pathRewrite: {'^/api' : ''}
            }
        }
    }
}
```

效果为 `http://localhost/api/abc => http://api.com:8000/abc`

## 参考

- <https://cli.vuejs.org/zh/config/#devserver-proxy>
- <https://www.webpackjs.com/configuration/dev-server/#devserver-proxy>
