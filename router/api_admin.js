const router = require("express")();
const moon = require("../modules/moon");
const dateformat = require("dateformat");

router.get("/queryAll", async (req, res) => {
    let doc = await moon.find();
    for(i in doc) {
        for(j in doc[i].remarks) {
            // console.log(doc[i].remarks.dateformat);
            doc[i].remarks[j].dateformat = dateformat(doc[i].remarks[j].time, "yyyy-mm-dd HH:mm:ss")
        }
    }
    // console.log(doc[1]);
    res.status(200).send({status: 200, data: doc});
});

module.exports = router;