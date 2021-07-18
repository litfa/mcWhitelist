
const api = require("./../api");
const moon = require("./../moon");

let wlQuery = async (data) => {
    if (data.type == "GroupMessage" &&
        data.messageChain[1].type == "Plain" &&
        data.sender.group.id == config.mirai.group &&
        data.messageChain[1].text.indexOf(".查询") == 0
        // getValue(config.mirai.op, data.sender.id)
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
}

module.exports = wlQuery;