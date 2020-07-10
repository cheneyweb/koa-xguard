const log = require('tracer').colorConsole()

global._guardMap = {}
global._guardBlackMap = {}

module.exports = function (guardConfig = {}) {
    return function xguard(ctx, next) {
        // 获取IP
        let ip = ctx.request.ip
        let keyMap = { ip }
        // 获取xauth中的token
        let token = ctx.tokenVerify
        if (token) {
            keyMap = { ip, ...token }
        }
        // 获取防护速率和规则
        let key
        let rule
        // 遍历所有需要防护的API的KEY
        for (let item in guardConfig.key) {
            // 首先判断请求method是否匹配
            if (item.indexOf(':') > 0) {
                let itemArr = item.split(':')
                if (itemArr[0] != ctx.method) {
                    continue
                }
                item = itemArr[1]
            }
            // 其次判断请求url是否匹配
            if (new RegExp(item).test(ctx.url)) {
                key = guardConfig.api[item]
                break
            }
        }
        // 遍历所有需要防护的API规则
        for (let item in guardConfig.api) {
            // 首先判断请求method是否匹配
            if (item.indexOf(':') > 0) {
                let itemArr = item.split(':')
                if (itemArr[0] != ctx.method) {
                    continue
                }
                item = itemArr[1]
            }
            // 其次判断请求url是否匹配
            if (new RegExp(item).test(ctx.url)) {
                rule = guardConfig.api[item]
                break
            }
        }
        // 默认KEY
        if (!key) {
            key = guardConfig.key.default
        }
        // 默认规则
        if (!rule) {
            rule = guardConfig.api.default
        }
        // 获取防护KEY
        let keyArr = key.split(',')
        let guardKey = ''
        for (let item of keyArr) {
            guardKey += keyMap[item] || ''
        }
        // 相同KEY内容存在
        if (_guardMap[guardKey]) {
            // 通过防护
            if (pass(guardKey, rule)) {
                return next()
            }
        }
        // KEY内容不存在则初始化 
        else {
            _guardMap[guardKey] = { count: 1, lastTime: Date.now() }
            return next()
        }
    }
}

// 判断是否放行
function pass(key, rule) {
    // 黑名单检查
    if (_guardBlackMap[key]) {
        log.warn(`[黑名单拦截]${key}`)
        return false
    }
    let req = _guardMap[key]
    let rateArr = rule.split('/')
    let rateCount = +rateArr[0] // 限速数量
    let rateTime = rateArr[1]   // 限速时间
    let ratePunish = rateArr[2] // 限速惩罚
    // 计算时间区间
    let timeInterval = 0
    let sIndex = rateTime.indexOf('s')
    let mIndex = rateTime.indexOf('m')
    if (rateTime == 's') {
        timeInterval = 1000
    } else if (rateTime == 'm') {
        timeInterval = 60000
    } else if (sIndex > 0) {
        timeInterval = rateTime.substring(0, sIndex) * 1000
    } else if (mIndex > 0) {
        timeInterval = rateTime.substring(0, mIndex) * 60000
    }
    // 超过时间区间，计数器重置
    if (Date.now() - req.lastTime > timeInterval) {
        req.count = 0
        req.lastTime = Date.now()
    }
    // 时间区间内
    else {
        // 计数器累加
        if (req.count < rateCount) {
            req.count++
        }
        // 超过数量限制
        else {
            // 是否加入黑名单
            if (ratePunish == 'b') {
                _guardBlackMap[key] = true
            }
            log.warn(`[限流拦截]${key}`)
            return false
        }
    }
    return true
}