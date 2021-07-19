const wlExecute = (command) => {
    // mcsm操作
    // let isErr =  wlEdit();
    let isErr = 0;
    if (config.mcsm.server == Object) {
        for (i in config.mcsm.server) {
            await api.mcsm.execute(msg, config.mcsm.server[i]).then().catch(err => {
                console.log(err);
                isErr++;
            })
        }
        // 否则只有单个
    }
    if (isErr > 0) {
        api.qq.sendGroupMessage([
            { "type": "Plain", "text": `发送失败 ${isErr}` }
        ], config.mirai.group);
    } else {
        api.qq.sendGroupMessage([
            { "type": "Plain", "text": `发送成功 ${msg}` }
        ], config.mirai.group)
    }
}