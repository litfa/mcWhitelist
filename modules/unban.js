const schedule = require('node-schedule');
const moon = require("./moon");
const api = require("./api");
console.log(111);

schedule.scheduleJob("0 * * * * *", async () => {
    console.log(111);
    let doc = await moon.find({
        unbanTime: {
            $lt: Date.now(),
        },
        status: "2"
    })
    for (i in doc) {
        doc[i].remarks.push({ time: Date.now(), text: "自动解封" })
        moon.updateOne({
            _id: doc[i]._id
        }, {
            unbanTime: undefined,
            status: "1",
            remarks: doc[i].remarks
        }).then(async doc => {
            // mcsm操作
            // let isErr =  wlEdit();
            let isErr = 0;
            if (config.mcsm.server == Object) {
                for (j in config.mcsm.server) {
                    await api.mcsm.execute(`whitelist add "${doc[i].name}"`, config.mcsm.server[j]).then().catch(err => {
                        console.log(err);
                        isErr++;
                    })
                }
                // 否则只有单个
            } else {
                await api.mcsm.execute(`whitelist add "${doc[i].name}"`, config.mcsm.server).then().catch(err => {
                    console.log(err);
                    isErr++;
                });
            }
            if (isErr > 0) {
                console.log("白名单删除异常");
                return;
            }
            console.log(`已解封${doc[i].name}`);
        }).catch(err => {
            console.log(err);
            
        })
    }
})

// findOne方法返回一条文档 默认返回当前集合中的第一条文档
// User.findOne({name: '李四'}).then(result => console.log(result))
// 查询用户集合中年龄字段大于20并且小于40的文档
// User.find({age: {$gt: 20, $lt: 40}}).then(result => console.log(result))
// 查询用户集合中hobbies字段值包含足球的文档
// User.find({hobbies: {$in: ['足球']}}).then(result => console.log(result))
// 选择要查询的字段
// User.find().select('name email -_id').then(result => console.log(result))
// 根据年龄字段进行升序排列
// User.find().sort('age').then(result => console.log(result))
// 根据年龄字段进行降序排列
// User.find().sort('-age').then(result => console.log(result))
// 查询文档跳过前两条结果 限制显示3条结果
// User.find().skip(2).limit(3).then(result => console.log(result))