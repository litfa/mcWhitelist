
const api = require("./../api");
const moon = require("./../moon");
const wlExecute = require("./execute")

function getValue(arr, index) {
    for (var i in arr) {
        if (arr[i] == index) {
            return true;
        }
    }
    return false;
}

const wlSend = async (data) => {
    if (data.type == "GroupMessage" &&
        data.messageChain[1].type == "Plain" &&
        data.sender.group.id == config.mirai.group &&
        data.messageChain[1].text.indexOf(".wl ") == 0

    ) {
        if (!getValue(config.mirai.op, data.sender.id)) {
            api.qq.sendGroupMessage([
                { "type": "At", "target": data.sender.id },
                { "type": "Plain", "text": ` 你没有权限这样做` }
            ], config.mirai.group);
            return;
        }
        var msg = data.messageChain[1].text.split(".wl ");
        if (msg[1].indexOf("send ") != -1) {
            msg = msg[1].split("send ");
            // 此时 msg 为 指令
            console.log(msg[1]);
            let status = await wlExecute(msg[1])
            if (status.status == 0) {
                api.qq.sendGroupMessage([
                    { "type": "Plain", "text": `发送失败 ${isErr}` }
                ], config.mirai.group);
            } else if (status.status == 1) {
                api.qq.sendGroupMessage([
                    { "type": "Plain", "text": `发送成功 ${msg[1]}` }
                ], config.mirai.group)
            }
            // mcsm操作
            // let isErr =  wlEdit();
            // let isErr = 0;
            // if (config.mcsm.server == Object) {
            //     for (i in config.mcsm.server) {
            //         var res = await api.mcsm.execute(msg[1], config.mcsm.server[i]).then().catch(err => {
            //             console.log(err);
            //             isErr++;
            //         })
            //     }
            //     // 否则只有单个
            // } else {
            //     var res = await api.mcsm.execute(msg[1], config.mcsm.server).then().catch(err => {
            //         console.log(err);
            //         isErr++;
            //     });
            // }
            // if (isErr > 0) {
            //     api.qq.sendGroupMessage([
            //         { "type": "Plain", "text": `发送失败 ${isErr}` }
            //     ], config.mirai.group);
            // } else {
            //     api.qq.sendGroupMessage([
            //         { "type": "Plain", "text": `发送成功 ${msg[1]}` }
            //     ], config.mirai.group)
            // }
        } else if (msg[1].indexOf("开服") != -1) {
            api.qq.sendGroupMessage([
                { "type": "Plain", "text": `咕咕咕 下次一定！` }
            ], config.mirai.group);
        } else if (msg[1].indexOf("关服") != -1) {
            api.qq.sendGroupMessage([
                { "type": "Plain", "text": `咕咕咕 下次一定！` }
            ], config.mirai.group);
        }
    }
}
module.exports = wlSend;