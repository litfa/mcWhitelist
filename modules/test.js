// var test = /^[a-zA-Z][a-zA-Z0-9\s]{2,15}$/
global.config = {}
config.mirai = {}
require("./../config")
const api = require("./api")
api.mcsm.execute("asas", "ad").then().catch(err => console.log("err"));