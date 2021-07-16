const api = require("./api");

const edit = async function (method, xboxName) {
    let isErr = 0;
    if (config.mcsm.server == Object) {
        for (i in config.mcsm.server) {
            var res = await api.mcsm.execute(`whitelist ${method} "${xboxName}"`, config.mcsm.server[i]).then().catch(err => {
                console.log(err);
                isErr++;
            })
        }
        // 否则只有单个
    } else {
        var res = await api.mcsm.execute(`whitelist ${method} "${xboxName}"`, config.mcsm.server).then().catch(err => {
            console.log(err);
            isErr++;
        });
    }
    return isErr;
    // if (isErr) {
    //     api.qq.sendGroupMessage([
    //         { "type": "At", "target": data.sender.id },
    //         { "type": "Plain", "text": ` 申请失败，白名单添加异常 ${isErr}` }
    //     ], config.mirai.group);
    // } else {
    //     api.qq.sendGroupMessage([
    //         { "type": "At", "target": data.sender.id },
    //         { "type": "Plain", "text": ` 申请成功，成功将 ${xboxName} 加入白名单！` }
    //     ], config.mirai.group)
    // }
}
module.exports = edit;
