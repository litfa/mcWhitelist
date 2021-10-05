/**
 * 状态码：
 * 0 退群/未添加
 * 1 正常
 * 2 封禁
 * 3 永久封禁
 */

// const { Logger } = require("log4js")
const ws = require("ws")
// const axios = require("axios")
const api = require("./api")
const moon = require("./moon")
const wladd = require("./wlset/add")
const wlKick = require("./wlset/kick")
const wlQuit = require("./wlset/quit")
const wlQuery = require("./wlset/query")
const wlMenu = require("./wlset/menu")
const wlSend = require("./wlset/send")
const wlExecute = require("./wlset/execute")
const wlOpEdit = require("./wlset/opEdit")
// const wlJoinGroup = require("./joinGroup")
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

        // 入群申请
        // wlJoinGroup(data)

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
        // 获取 某项是否在数组中
        function getValue(arr, index) {
            for (var i in arr) {
                if (arr[i] == index) {
                    return true;
                }
            }
            return false;
        }
        // 管理员操作 统一判断权限
        // 管理员操作
        // 执行wl指令
        if (
            data.type == "GroupMessage" &&
            data.messageChain[1].type == "Plain" &&
            data.sender.group.id == config.mirai.group &&
            data.messageChain[1].text.indexOf(".wl ") == 0
        ) {
            if (
                getValue(config.mirai.op, data.sender.id)
            ) {
                // 为true一定是管理员 
                wlOpEdit(data)
                wlSend(data)
            } else {
                // 无权限提示
                api.qq.sendGroupMessage([
                    { "type": "At", "target": data.sender.id },
                    { "type": "Plain", "text": ` 你没有权限这样做` }
                ], config.mirai.group);
                return;
            }
        }
        // 查询
        wlQuery(data);
        // 菜单
        wlMenu(data);

    });
}
run()

