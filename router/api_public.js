const router = require("express")();
const moon = require("./../modules/moon");
const dateformat = require("dateformat");

router.get("/query", async (req, res) => {
    // console.log(req.query);
    let numtest = /[1-9][0-9]{4,10}/;
    if (numtest.test(req.query.wd)) {
        // 这个一定是qq
        let doc = await moon.findOne({ qq: req.query.wd }).select("name qq status credit remarks unbanTime -_id");
        console.log(doc);

        if (doc) {
            for (i in doc.remarks) {
                doc.remarks[i].dateformat = dateformat(doc.remarks[i].time, "yyyy-mm-dd HH:mm:ss");
            }
            res.status(200).send({ status: 200, data: doc });
            return;
        }
    }
    let doc = await moon.findOne({ name: req.query.wd }).select("name qq status credit remarks unbanTime -_id");
    if (doc) {
        for (i in doc.remarks) {
            doc.remarks[i].dateformat = dateformat(doc.remarks[i].time, "yyyy-mm-dd HH:mm:ss");
        }
        res.status(200).send({ status: 200, data: doc });
        return;
    }
    res.status(200).send({ status: 201 });
})
module.exports = router

