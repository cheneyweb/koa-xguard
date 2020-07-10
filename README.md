# koa-xguard
Koa路由中间件，实现API防刷限流等防护

[传送门：XServer官网文档](http://www.xserver.top)

框架目录结构
>
    ├── app.js
    ├── config
    │   ├── default.json
    │   ├── develop.json
    │   └── production.json
    ├── node_modules
    ├── package.json
    └── xguard_modules
        └── koa-xguard

快速上手
>
```js
    1、const xguard = require('koa-xguard')
    2、app.use(xguard())
```

配置说明
>
    在/config/default.json中，有如下配置
```json
"guard": {
        "key": {
            "default": "ip",
            "/admin/*": "ip,id" #除ip外为xauth中token的解析值
        },
        "api": {
            "default": "1/s",
            "/test/*": "5/m/b"  #数量/时间/惩罚，时间可选s秒m分n不限时间，惩罚可选b，永久拉黑
        }
    }
```

帮助联系
>
	作者:cheneyxu
	邮箱:457299596@qq.com
	QQ:457299596

更新日志
>
	2020.07.10:初版
