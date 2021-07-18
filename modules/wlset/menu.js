
const api = require("./../api");
// const moon = require("./../moon");
let wlMenu = async (data) => {
    if (data.type == "GroupMessage" &&
        data.messageChain[1].type == "Plain" &&
        data.sender.group.id == config.mirai.group &&
        data.messageChain[1].text.indexOf(".菜单") == 0
        // getValue(config.mirai.op, data.sender.id)
    ) {
        api.qq.sendGroupMessage([
            { "type": "At", "target": data.sender.id },
            { "type": "Plain", "text": ` \nxingWl v1.1.0\n使用 \n.申请白名单 id 申请白名单\n使用 .查询qq / .查询id 查询 id/qq` }
        ], config.mirai.group);
    }
}

module.exports = wlMenu;
