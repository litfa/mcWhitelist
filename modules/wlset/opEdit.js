
const api = require("./../api");
const moon = require("./../moon");
const wlExecute = require("./execute")

const wlOpEdit = async (data) => {
    var msg = data.messageChain[1].text.split(".wl ");

    if (msg[1].indexOf("ban ") != -1) {
        xboxName = msg[1].split("ban ");
    }

    if (msg[1].indexOf("delid ") != -1) {
        msg = msg[1].split("delid ");
        // 此时 msg 为id
        console.log(msg[1]);
        var stasusMsg = "";
        var doc = await moon.findOne({ name: msg });
        if (doc) {
            if (doc.status != "1" && doc.status != "0") {
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 玩家 ${msg} 已被封禁` }
                ], config.mirai.group);
                return;
            }
            if (doc.status == "0") {
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 该玩家未申请白名单` }
                ], config.mirai.group);
                return;
            }
            doc.remarks.push({ time: Date.now(), text: ` 被管理员 ${data.sender.id} 移除白名单` })
            moon.updateOne({ _id: doc._id }, {
                status: "0",
                remarks: doc.remarks
            }).then(doc => {
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 玩家 ${msg} 已成功从数据库移除` }
                ], config.mirai.group);
            })
            // // mcsm操作
            let status = await wlExecute(`whitelist remove "${doc.name}"`)

            if (status.status == 0) {
                api.qq.sendGroupMessage([
                    { "type": "Plain", "text": `白名单删除异常 ${status.isErr}` }
                ], config.mirai.group);
            } else if (status.status == 1) {
                api.qq.sendGroupMessage([
                    { "type": "Plain", "text": `已成功删除 ${msg}[${doc.qq}] 的白名单` }
                ], config.mirai.group)
            }
            // // let isErr =  wlEdit();
            // let isErr = 0;
            // if (config.mcsm.server == Object) {
            //     for (i in config.mcsm.server) {
            //         var res = await api.mcsm.execute(`whitelist remove "${doc.name}"`, config.mcsm.server[i]).then().catch(err => {
            //             console.log(err);
            //             isErr++;
            //         })
            //     }
            //     // 否则只有单个
            // } else {
            //     var res = await api.mcsm.execute(`whitelist remove "${doc.name}"`, config.mcsm.server).then().catch(err => {
            //         console.log(err);
            //         isErr++;
            //     });
            // }
            // if (isErr > 0) {
            //     api.qq.sendGroupMessage([
            //         { "type": "Plain", "text": `白名单删除异常 ${isErr}` }
            //     ], config.mirai.group);
            // } else {
            //     api.qq.sendGroupMessage([
            //         { "type": "Plain", "text": `已成功删除 ${msg}[${doc.qq}] 的白名单` }
            //     ], config.mirai.group)
            // }
        } else {
            api.qq.sendGroupMessage([
                { "type": "Plain", "text": `白名单中没有此人` }
            ], config.mirai.group);
        }
        // if (config.mcsm.server == Object) {
        //     for (i in config.mcsm.server) {
        //         var res = await api.mcsm.execute(`whitelist remove ${msg[1]}`, config.mcsm.server[i])
        //     }
        // } else {
        //     var res = await api.mcsm.execute(`whitelist remove ${msg[1]}`, config.mcsm.server);
        //     console.log(res);
        //     if (res.data.status == 200) {
        //         stasusMsg += `服务器返回 200. 玩家 ${msg[1]} 已成功从服务器移除`
        //     }
        // };
        // moon.findOneAndDelete({ name: msg[1] }).then(doc => {
        //     console.log(doc);

        // })
    } else if (msg[1].indexOf("delqq ") != -1) {
        // 通过qq删
        msg = msg[1].split("delqq ");
        // 此时 msg 为 qq
        console.log(msg);
        var doc = await moon.findOne({ qq: msg });
        if (doc && doc.status != "0") {
            // 非0 非1 封禁
            if (doc.status != "1") {
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 玩家 ${msg} 已被封禁` }
                ], config.mirai.group);
                return;
            }
            // 否则就继续
            doc.remarks.push({ time: Date.now(), text: ` 被管理员 ${data.sender.id} 移除白名单` })
            moon.updateOne({ _id: doc._id }, {
                status: "0",
                remarks: doc.remarks
            }).then(doc => {
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 玩家 ${msg} 已成功从数据库移除` }
                ], config.mirai.group);
            })
            // mcsm操作
            // let isErr =  wlEdit();
            let status = await wlExecute(`whitelist remove "${doc.name}"`)
            if (status.status == 0) {
                api.qq.sendGroupMessage([
                    { "type": "Plain", "text": `白名单删除异常 ${status.isErr}` }
                ], config.mirai.group);
            } else if (status.status == 1) {
                api.qq.sendGroupMessage([
                    { "type": "Plain", "text": `已成功删除 ${msg}[${doc.qq}] 的白名单` }
                ], config.mirai.group)
            }
        } else {
            api.qq.sendGroupMessage([
                { "type": "At", "target": data.sender.id },
                { "type": "Plain", "text": ` 该成员未申请白名单` }
            ], config.mirai.group);
            return;
        }
    }
}

module.exports = wlOpEdit;
