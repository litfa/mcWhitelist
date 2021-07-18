
const api = require("./../api");
const moon = require("./../moon");

let wlKick = async (data) => {
    if (data.type == "MemberLeaveEventKick" &&
        data.member.group.id == config.mirai.group
    ) {
        // 查是否有白名
        // 如果直接尝试更新 结果不好判断 先查 再更新
        var doc = await moon.findOne({ qq: data.member.id });
        // 若有 删白名 改状态(永久封禁) 加备注
        if (doc) {
            api.qq.sendGroupMessage([
                { "type": "Plain", "text": `玩家 ${data.member.memberName}[${data.member.id}] 被管理员 ${data.operator.memberName}[${data.operator.id}] 踢出本群，将删除他的白名单并拉黑!` }
            ], config.mirai.group)
            doc.remarks.push({ time: Date.now(), text: "玩家被踢，自动拉黑" })
            await moon.updateOne({ _id: doc._id }, {
                status: "3",
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
                    { "type": "At", "target": data.operator.id },
                    { "type": "Plain", "text": `白名单删除异常 ${isErr}` }
                ], config.mirai.group);
            } else {
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.operator.id },
                    { "type": "Plain", "text": `已成功拉黑 ${data.member.memberName}[${data.member.id}] ` }
                ], config.mirai.group)
            }
        } else {
            // 未申请白名单 直接拉黑
            api.qq.sendGroupMessage([
                { "type": "Plain", "text": `成员 ${data.member.memberName}[${data.member.id}] 被管理员 ${data.operator.memberName}[${data.operator.id}]踢出本群，将自动拉黑!` }
            ], config.mirai.group);
            moon.create({
                qq: data.member.id,
                status: "3",
                remarks: [{ time: Date.now(), text: `成员被踢，自动拉黑 操作人 ${data.operator.id}` }]
            }).then(doc => {
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.operator.id },
                    { "type": "Plain", "text": `已成功拉黑 ${data.member.memberName}[${data.member.id}] ` }
                ], config.mirai.group);
            }).catch(err => {
                console.log(err);
            })
        }
    }
}

module.exports = wlKick;
