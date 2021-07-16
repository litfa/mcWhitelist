// 日志模块
var log4js = require("log4js");
var logger = log4js.getLogger();


logger.level = "all";
global.logger = logger;

module.exports = log4js.getLogger('xcLogConsole');


const ws = require("ws");
const axios = require("axios");
const fs = require("fs");
const md5 = require("md5");
// console.log(md5("awa"));

const express = require("express");
const cookieParser = require('cookie-parser');
const session = require('express-session');

// 配置文件
logger.info("加载配置文件")
global.config = {};
config.mirai = {};
config.session = "";
require("./config");
logger.info("配置文件加载成功");

logger.info("加载白名单插件")
require("./modules/wl");

logger.info("加载unban")
require("./modules/unban");

logger.info(`链接数据库 ${config.dbUrl}`)
require("./modules/connect");

const app = express();
// app.use(["/", "/index", "/index.html"], (req, res) => {
//     res.redirect("/public")
// })
// post解析
var bodyParser = require('body-parser');//用于req.body获取值的
app.use(bodyParser.json());
// 创建 application/x-www-form-urlencoded 编码解析
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static('./public'));

app.use("/api/public", require("./router/api_public"));

app.use(cookieParser());

app.use(session({
    secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串
    // 1天过期
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 1 }
}));

// 用户权限
app.use(["/admin", "/api/admin"], (req, res, next) => {
    if(req.session.isLogin || req.path == "/public/adminLogin") {
        next();
    }else{
        res.redirect("/public/adminLogin");
    }
})
app.get("/public/adminLogin", express.static('./public/adminLogin'))
app.post("/public/adminLogin", (req, res) => {
    // if(req.session.errLogin > 10) {
    //     return;
    // }
    console.log(req.body);
    try{
        let userInfo = fs.readFileSync(`./users/${req.body.username}.json`, "utf8");
        userInfo = JSON.parse(userInfo);
        if(userInfo.password == md5(req.body.password)) {
            req.session.isLogin = true;
            req.session.username = req.body.username;
            res.redirect("/admin");
            return;
        }
    }catch(e) {
        console.log(e);
    }
    if(req.session.errLogin) {
        req.session.errLogin++;
    }else{
        req.session.errLogin = 0;
    }
    res.send("<h1>账号或密码错误！</h1>");
})
app.use("/admin", express.static('./admin'));
app.use("/api/admin", require("./router/api_admin"));


app.listen(config.port);
