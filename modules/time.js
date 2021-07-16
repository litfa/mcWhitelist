const dateformat = require("dateformat");
Date.now();
let nowTime = () => dateformat(Date.now(), "yyyy-mm-dd HH:MM:ss");
console.log(nowTime());
console.log(nowTime());
console.log(nowTime());
console.log(Date.now());
setInterval(() => console.log(nowTime()),1000 )