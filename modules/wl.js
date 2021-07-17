/**
 * 状态码：
 * 0 退群/未添加
 * 1 正常
 * 2 封禁
 * 3 永久封禁
 */

// const { Logger } = require("log4js");
const ws = require("ws");
// const axios = require("axios");
const api = require("./api");
const moon = require("./moon");
// const wlEdit = require("./wlEdit")

// console.log(api);
async function run() {
    // mirai 认证
    await api.qq.auth();
    await api.qq.verify();
    // console.log(config.session);
    // ws
    logger.info(`链接mirai ws ws://${config.mirai.ip}:${config.mirai.port}}`)
    var sock = new ws(`ws://${config.mirai.ip}:${config.mirai.port}/all?sessionKey=${config.session}`);

    sock.on("open", function () {
        logger.info("ws 链接成功")
        // console.log("ws connect");
    });

    sock.on("message", async function (data) {
        // var i = 4;
        data = JSON.parse(data)
        logger.info(data);

        // console.log( data.type)
        // console.log(data.messageChain[1].type);
        // console.log(data.sender.group.id);
        // console.log( data.messageChain[1].text.indexOf(".申请白名单 "));       

        // 群消息
        // 文本
        // 当前群聊
        // 申请白名单
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
        // 事件操作
        // 成员被踢出群（该成员不是Bot） MemberLeaveEventKick
        // 成员被踢 改状态 封禁 加备注
        // 判断 被踢事件
        // 当前群聊
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
        // 玩家退群
        // 成员主动离群（该成员不是Bot）  MemberLeaveEventQuit
        // 改状态 删白名 返回结果
        // {
        //     type: 'MemberLeaveEventQuit',
        //     member: {
        //          id: 2032596838,
        //          memberName: 'm',
        //          permission: 'MEMBER',
        //     group: { id: 726155337, name: '小号', permission: 'MEMBER' }
        //     }
        // }
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
        /*
                {
                    type: 'MemberLeaveEventKick',
                    member: {
                    id: 209889074,
                    memberName: '阿巴',
                    permission: 'MEMBER',
                    group: { id: 726155337, name: '小号', permission: 'MEMBER' }
                    },
                    operator: {
                        id: 1585380249,
                        memberName: 'xing2233 test test',
                        permission: 'OWNER',
                        group: { id: 726155337, name: '小号', permission: 'MEMBER' }
                    }
                }
        */

        // 管理员操作
        function getValue(arr, index) {
            for (var i in arr) {
                if (arr[i] == index) {
                    return true;
                }
            }
            return false;
        }
        // .wl delid/delqq qq/id
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
                            { "type": "Plain", "text": `已成功删除 ${msg}[${doc.qq}] 的白名单` }
                        ], config.mirai.group)
                    }
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
        // 查询
        if (data.type == "GroupMessage" &&
            data.messageChain[1].type == "Plain" &&
            data.sender.group.id == config.mirai.group &&
            data.messageChain[1].text.indexOf(".查询") == 0 &&
            getValue(config.mirai.op, data.sender.id)
        ) {
            var msg = data.messageChain[1].text.split(".查询");
            let doc = "";
            if (msg[1].indexOf("id ") != -1) {
                msg = msg[1].split("id ");
                doc = await moon.findOne({ name: msg });
            } else if (msg[1].indexOf("qq ") != -1) {
                msg = msg[1].split("qq ");
                doc = await moon.findOne({ qq: msg });
            }
            console.log(doc);
            if (doc) {
                let status = "";
                switch (doc.status) {
                    case "1":
                        status = "正常";
                        break;
                    case "0":
                        status = "未申请白名单";
                        break;
                    case "2":
                        status = "临时封禁";
                        break;
                    case "3":
                        status = "永久封禁";
                        break;
                    case "4":
                        status = "临时封禁且不在群聊";
                        break;
                    case "5":
                        status = "数据异常";
                        break;
                    default:
                        break;
                }
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 该玩家是\n${doc.name}[${doc.qq}] \n玩家状态：${status}` }
                ], config.mirai.group);
            } else {
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 未查询到此人` }
                ], config.mirai.group);
            }
        }
        // 菜单
        if (data.type == "GroupMessage" &&
            data.messageChain[1].type == "Plain" &&
            data.sender.group.id == config.mirai.group &&
            data.messageChain[1].text.indexOf(".菜单") == 0 &&
            getValue(config.mirai.op, data.sender.id)
        ) {
            api.qq.sendGroupMessage([
                { "type": "At", "target": data.sender.id },
                { "type": "Plain", "text": ` xing-whitelist\n使用 .申请白名单 id 申请白名单\n使用 .查询qq / .查询id 查询 id/qq` }
            ], config.mirai.group);
        }
    });
}
run()

/*
{
  type: 'GroupMessage',
  messageChain: [
    { type: 'Source', id: 31077, time: 1625981090 },
    { type: 'Plain', text: 'b站名字多少' }
  ],
  sender: {
    id: 1260564171,
    memberName: '风起浪飘',
    permission: 'MEMBER',
    group: { id: 943016907, name: 'WLZ Pack材质交流群', permission: 'MEMBER' }
  }
}
*/