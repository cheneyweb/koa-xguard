// 系统配置参数
const config = require('config')
const port = config.server.port
// 应用服务相关
const Koa = require('koa')
const koaBody = require('koa-body')
const xguard = require(__dirname + '/xguard_modules/koa-xguard/index.js')
// 日志相关
const log = require('tracer').colorConsole({ level: config.log.level })
// 路由相关
const Router = require('koa-router')
const router = new Router()

// 初始化应用服务
const app = new Koa()
app.use(koaBody())
app.use(xguard(config.guard))
app.use(router.routes())

router.get('/test', async (ctx, next) => {
    ctx.body = 'Y'
})

// 启动应用服务
app.listen(port)
log.info(`XGuard服务启动【执行环境:${process.env.NODE_ENV},端口:${port}】`)
log.info(`受保护的路由路径【GET】【localhost:${port}/test】`)