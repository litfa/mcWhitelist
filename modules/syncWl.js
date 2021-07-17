const moon = require("./moon");
const api = require("./api");
const fs = require("fs");
const schedule = require('node-schedule');

async function run() {
    // fs.watch(filename[, options][, listener])
    // fs.watchFile()
    let wl = fs.readFileSync("./whitelistfile/whitelist.json")
    wl = JSON.parse(wl)
    // console.log(wl);
    for (i in wl) {
        // 有白名时才会同步
        if (!wl[i].ignoresPlayerLimit) {
            // 有xuid时 查看改没改游戏id
            if (wl[i].xuid) {
                // 查看数据库是否有xuid
                let data = await moon.findOne({ name: wl[i].name });
                if (data) {
                    // 数据库无xuid或xuid不对，更新xuid
                    if (!data.xuid || data.xuid != wl[i].xuid) {
                        data.remarks.push({ time: Date.now(), text: `自动同步xuid: ${wl[i].xuid}` })
                        moon.updateOne(data, {
                            xuid: wl[i].xuid,
                            remarks: data.remarks
                        });
                    }
                } else {
                    // 数据库未查到，可能是改名字或数据异常 尝试用xuid查
                    let dataXuid = await moon.findOne({ xuid: wl[i].xuid });
                    if (dataXuid) {
                        // 查到了 该过名字 更新名字
                        dataXuid.remarks.push({ time: Date.now(), text: `自动同步游戏id: ${wl[i].name}` })
                        moon.updateOne(dataXuid, {
                            name: wl[i].name,
                            remarks: data.remarks
                        });
                    } else {
                        // xuid也查不到 数据异常！ 由管理员处理
                        moon.create({
                            name: wl[i].name,
                            xuid: wl[i].xuid,
                            status: "5",
                            remarks: [{ time: Date.now(), text: "未在数据库中找到该玩家，数据异常" }]
                        })
                    }
                }
            }
        }
    }
}

// 每分钟运行
schedule.scheduleJob("0 0 0 * * *", async () => {
    run();
});