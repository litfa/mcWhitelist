
const api = require("./../api");
const moon = require("./../moon");

let wlAdd = async (data) => {
    if (data.type == "GroupMessage" &&
        data.messageChain[1].type == "Plain" &&
        data.sender.group.id == config.mirai.group &&
        data.messageChain[1].text.indexOf(".申请白名单 ") == 0
    ) {
        // 游戏名
        xboxName = data.messageChain[1].text.split(".申请白名单 ")[1];
        console.log(xboxName);

        // 名字是否不合法
        if (!/^[a-zA-Z][a-zA-Z0-9\s]{2,15}$/.test(xboxName)) {
            api.qq.sendGroupMessage([
                { "type": "At", "target": data.sender.id },
                { "type": "Plain", "text": ` 申请失败，id有误！` }
            ], config.mirai.group);
            return;
        }
        // 群昵称是否包含id
        if (data.sender.memberName.indexOf(xboxName) == -1) {
            api.qq.sendGroupMessage([
                { "type": "At", "target": data.sender.id },
                { "type": "Plain", "text": `在申请申请白名单之前，请确保你的群昵称中包含你的游戏id！` }
            ], config.mirai.group);
            return;
        }
        // 判断有无重复
        // 使用qq查询
        var doc = await moon.findOne({ qq: data.sender.id });
        console.log(doc);
        // 有结果
        // 白名修改类型
        let addStatus = "";
        if (doc) {
            // 是否为 退群 若退群 继续执行 若封禁 返回封禁原因
            // 不是退群 不是正常 即为封禁 返回封禁原因
            if (doc.status != "0" && doc.status != "1" && doc.status != "5") {
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": `申请失败，您已被封禁! \n` },
                    { "type": "Plain", "text": doc.remarks[doc.remarks.length - 1].text }
                ], config.mirai.group);
                return;
            }

            // 若是1 正常 返回 已申请
            if (doc.status == "1") {
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` ${doc.name} 申请失败，您已申请过白名单` }
                ], config.mirai.group);
                return;
            }
            // 若是退群 
            if (doc.status == "0") {
                // 设置类型为 修改
                addStatus = "edit";
            }
        }
        // 使用名字查询
        var doc2 = await moon.findOne({ name: xboxName });
        console.log(doc2);
        // 若有 返回已被申请
        if (doc2 && doc2.status != "0" && doc2.status != "5") {
            api.qq.sendGroupMessage([
                { "type": "At", "target": data.sender.id },
                { "type": "Plain", "text": ` ${doc2.name} 申请失败，此id已被 ${doc2.qq} 申请` }
            ], config.mirai.group);
            return;
        }

        // 以上均无出错 即为正常 添加数据库及白名单
        // {
        //     credit: 12,
        //     status: '未答题',
        //     remarks: [],
        //     _id: 60ea8851632f3fdf971432b1,
        //     qq: 1585380249,
        //     name: 'xboxName',
        //     __v: 0
        //   }
        if (addStatus == "edit") {
            // 修改数据库
            // 用刚刚的数据查
            // 备注
            let remarks = doc.remarks;
            remarks.push({ time: Date.now(), text: `退群玩家修改白名单为 ${xboxName}` });
            await moon.updateOne({ _id: doc._id }, {
                qq: data.sender.id,
                name: xboxName,
                status: "1",
                remarks: remarks
            }).then(doc => {
                console.log(doc);
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 修改成功，成功将 ${xboxName} 加入数据库！` }
                ], config.mirai.group)
            }).catch(err => {
                console.log(err);
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 程序异常，数据库修改失败.` }
                ], config.mirai.group)
            })
        } else {
            // 添加数据库
            await moon.create({
                qq: data.sender.id,
                name: xboxName,
                status: "1",
                remarks: [{ time: Date.now(), text: `玩家申请白名单 ${xboxName}` }]
            }).then(doc => {
                console.log(doc);
                api.qq.sendGroupMessage([
                    { "type": "At", "target": doc.qq },
                    { "type": "Plain", "text": ` 申请成功，成功将 ${doc.name} 加入数据库！` }
                ], config.mirai.group)
            }).catch(err => {
                console.log(err);
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 程序异常，数据库添加失败.` }
                ], config.mirai.group)
            })

        }

        // 添加白名单
        // 若为数组（对象） 遍历
        // let isErr =  wlEdit("add", xboxName);
        // console.log(isErr);
        let isErr = 0;
        if (config.mcsm.server == Object) {
            for (i in config.mcsm.server) {
                var res = await api.mcsm.execute(`whitelist add "${xboxName}"`, config.mcsm.server[i]).then().catch(err => {
                    console.log(err);
                    isErr++;
                })
            }
            // 否则只有单个
        } else {
            var res = await api.mcsm.execute(`whitelist add "${xboxName}"`, config.mcsm.server).then().catch(err => {
                console.log(err);
                isErr++;
            });
        }
        if (isErr > 0) {
            api.qq.sendGroupMessage([
                { "type": "At", "target": data.sender.id },
                { "type": "Plain", "text": ` 申请失败，白名单添加异常 ${isErr}` }
            ], config.mirai.group);
        } else {
            api.qq.sendGroupMessage([
                { "type": "At", "target": data.sender.id },
                { "type": "Plain", "text": ` 申请成功，成功将 ${xboxName} 加入白名单！` }
            ], config.mirai.group)
        }
    }
}
module.exports = wlAdd;