
const api = require("./../api");
const moon = require("./../moon");

let wlQuit = async (data) => {
    if (data.type == "MemberLeaveEventQuit" &&
        data.member.group.id == config.mirai.group
    ) {
        // 查是否有白名
        // 如果直接尝试更新 结果不好判断 先查 再更新
        // 判断 是否已被封禁 若被封禁，不执行操作
        var doc = await moon.findOne({ qq: data.member.id });
        // 若有 删白名 改状态(0) 加备注
        if (doc) {
            if (doc.status == "3") {
                api.qq.sendGroupMessage([
                    { "type": "Plain", "text": `玩家 ${data.member.memberName}[${data.member.id}] 退出了本群,由于他已被拉黑，所以不执行操作` }
                ], config.mirai.group)
                return;
            }
            api.qq.sendGroupMessage([
                { "type": "Plain", "text": `玩家 ${data.member.memberName}[${data.member.id}] 退出了本群,将删除他的白名单!` }
            ], config.mirai.group)
            doc.remarks.push({ time: Date.now(), text: "玩家退群，删白名。" })
            await moon.updateOne({ _id: doc._id }, {
                status: "0",
                remarks: doc.remarks
            }).then(doc => {
                console.log(doc);
            }).catch(err => {
                console.log(err);
            })
            // mcsm操作
            // let isErr =  wlEdit();
            let isErr = 0;
            if (config.mcsm.server == Object) {
                for (i in config.mcsm.server) {
                    var res = await api.mcsm.execute(`whitelist remove "${doc.name}"`, config.mcsm.server[i]).then().catch(err => {
                        console.log(err);
                        isErr++;
                    })
                }
                // 否则只有单个
            } else {
                var res = await api.mcsm.execute(`whitelist remove "${doc.name}"`, config.mcsm.server).then().catch(err => {
                    console.log(err);
                    isErr++;
                });
            }
            if (isErr > 0) {
                api.qq.sendGroupMessage([
                    { "type": "Plain", "text": `白名单删除异常 ${isErr}` }
                ], config.mirai.group);
            } else {
                api.qq.sendGroupMessage([
                    { "type": "Plain", "text": `已成功删除 ${data.member.memberName}[${data.member.id}] 的白名单` }
                ], config.mirai.group)
            }
        } else {
            // 未申请白名单 不执行操作
            api.qq.sendGroupMessage([
                { "type": "Plain", "text": `成员 ${data.member.memberName}[${data.member.id}] 退出本群，由于他未申请白名单，不执行操作!` }
            ], config.mirai.group);
        }
    }
}

module.exports = wlQuit;
