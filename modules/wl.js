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
const wladd = require("./wlset/add")
const wlKick = require("./wlset/kick")
const wlQuit = require("./wlset/quit")
const wlQuery = require("./wlset/query")
const wlMenu = require("./wlset/menu")
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
        wladd(data)
        // 事件操作
        // 成员被踢出群（该成员不是Bot） MemberLeaveEventKick
        // 成员被踢 改状态 封禁 加备注
        // 判断 被踢事件
        // 当前群聊
        wlKick(data)
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
        wlQuit(data)

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
        wlQuery(data);
        // 菜单
        wlMenu(data);

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