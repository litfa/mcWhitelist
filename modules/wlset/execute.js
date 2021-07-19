const api = require("./../api");

const wlExecute = async (command) => {
    // mcsm操作
    // let isErr =  wlEdit();
    let isErr = 0;
    for (i in config.mcsm.server) {
        await api.mcsm.execute(command, config.mcsm.server[i]).then().catch(err => {
            console.log(err);
            isErr++;
        })
    }
    if (isErr > 0) {
        return {
            status: 0,
            isErr: isErr
        }

    } else {
        return {
            status: 1
        }
    }
}
module.exports = wlExecute;