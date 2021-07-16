const axios = require("axios");

const api = {
    qq: {
        // 开始认证
        auth: () => {
            return new Promise((resove, reject) => {
                axios({
                    method: "POST",
                    url: `http://${config.mirai.ip}:${config.mirai.port}/auth`,
                    data: {
                        authKey: config.mirai.apiKey
                    }
                }).then(doc => {
                    config.session = doc.data.session;
                    // console.log(config.session);
                    resove(doc);
                }).catch(err => {
                    reject(err)
                })
            })

        },

        // 校验 Session(绑定 qq )
        verify: () => {
            return new Promise((resove, reject) => {
                axios({
                    method: "POST",
                    url: `http://${config.mirai.ip}:${config.mirai.port}/verify`,
                    data: {
                        "sessionKey": config.session,
                        "qq": config.mirai.botQQ
                    }
                }).then(doc => {
                    // config.session = doc.data.session;
                    // console.log(config.session);
                    resove(doc);
                }).catch(err => {
                    reject(err)
                })
            })

        },
        // 发消息
        sendGroupMessage: (text, group) => {
            return new Promise((resove, reject) => {

                axios({
                    method: "POST",
                    url: `http://${config.mirai.ip}:${config.mirai.port}/sendGroupMessage`,
                    data: {
                        "sessionKey": config.session,
                        "target": group,
                        "messageChain": text
                    }
                }).then(doc => {
                    resove(doc);
                }).catch(err => {
                    reject(err)
                });
            })
        },

        // 释放 Session
        release: () => {
            return new Promise((resove, reject) => {
                axios({
                    method: "POST",
                    url: `${config.mirai.url}/release`,
                    data: {
                        sessionKey: config.session,
                        qq: config.mirai.botQQ
                    }
                }).then(doc => {
                    resove(doc);
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
    mcsm: {
        execute: (message, serverName) => {
            return new Promise((resove, reject) => {
                axios({
                    method: "POST",
                    // 地址: http://127.0.0.1:23333/api/execute
                    url: `${config.mcsm.url}/api/execute?apikey=${config.mcsm.apiKey}`,
                    data: {
                        name : serverName,
                        command : message
                    }
                }).then(doc => {
                    resove(doc);
                }).catch(err => {
                    reject(err)
                })
            })
        }
    }
}

module.exports = api;