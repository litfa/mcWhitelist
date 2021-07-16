const router = require("express")();
const moon = require("../modules/moon");
const dateformat = require("dateformat");
const api = require("./../modules/api")

router.get("/queryAll", async (req, res) => {
    let doc = await moon.find();
    for (i in doc) {
        for (j in doc[i].remarks) {
            // console.log(doc[i].remarks.dateformat);
            doc[i].remarks[j].dateformat = dateformat(doc[i].remarks[j].time, "yyyy-mm-dd HH:MM:ss")
        }
    }
    // console.log(doc[1]);
    res.status(200).send({ status: 200, data: doc });
});

router.post("/removeWl", async (req, res) => {
    let doc = await moon.findOne({ _id: req.body._id });
    doc.remarks.push({ time: Date.now(), text: `管理员 ${req.session.username} 移除了白名单` })
    await moon.updateOne({ _id: req.body._id }, {
        status: "0",
        remarks: doc.remarks
    }).then(doc => {
        console.log(doc);
    }).catch(err => {
        res.send({ status: 201, msg: "数据库异常" })
        return;
    });
    // mcsm操作
    // let isErr =  wlEdit();
    let isErr = 0;
    if (config.mcsm.server == Object) {
        for (i in config.mcsm.server) {
            await api.mcsm.execute(`whitelist remove "${doc.name}"`, config.mcsm.server[i]).then().catch(err => {
                console.log(err);
                isErr++;
            })
        }
        // 否则只有单个
    } else {
        await api.mcsm.execute(`whitelist remove "${doc.name}"`, config.mcsm.server).then().catch(err => {
            console.log(err);
            isErr++;
        });
    }
    if (isErr > 0) {
        res.send({ status: 201, msg: "白名单删除异常" + isErr })
        return;
    }
    res.status(200).send({ status: 200 })
})

router.post("/ban", async (req, res) => {
    let { time, text, _id } = req.body;
    time = Number(time);
    console.log(time);
    unbanTime = Date.now() + time;
    console.log(unbanTime);
    unbanTimeFormat = dateformat(unbanTime, "yyyy-mm-dd HH:MM:ss")
    console.log(unbanTimeFormat);
    let doc = await moon.findOne({ _id: req.body._id });
    doc.remarks.push({ time: Date.now(), text: `被管理员 ${req.session.username} 封禁至${unbanTimeFormat}，封禁原因：${text} ` })
    await moon.updateOne({ _id: req.body._id }, {
        status: "2",
        unbanTime: unbanTime,
        remarks: doc.remarks
    }).then(doc => {
        console.log(doc);
    }).catch(err => {
        res.send({ status: 201, msg: "数据库异常" })
        return;
    });
    // mcsm操作
    // let isErr =  wlEdit();
    let isErr = 0;
    if (config.mcsm.server == Object) {
        for (i in config.mcsm.server) {
            await api.mcsm.execute(`whitelist remove "${doc.name}"`, config.mcsm.server[i]).then().catch(err => {
                console.log(err);
                isErr++;
            })
        }
        // 否则只有单个
    } else {
        await api.mcsm.execute(`whitelist remove "${doc.name}"`, config.mcsm.server).then().catch(err => {
            console.log(err);
            isErr++;
        });
    }
    if (isErr > 0) {
        res.send({ status: 201, msg: "白名单删除异常" + isErr })
        return;
    }
    res.status(200).send({ status: 200 })
})


module.exports = router;