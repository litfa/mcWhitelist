// const { default: axios } = require("axios")

let app = new Vue({
    el: "#app",
    data: {
        wd: "",
        isShow: false,
        errShow: false,
        info: {}
    },
    methods: {
        query: function () {
            let that = this;
            axios.get(`/api/public/query?wd=${that.wd}`).then(res => {
                if(res.data.status != 200) {
                    that.errShow = true;
                    return;
                }
                // console.log(res);
                switch (res.data.data.status) {
                    case "1":
                        res.data.data.status = "正常";
                        break;
                    case "0":
                        res.data.data.status = "未申请白名单";
                        break;
                    case "2":
                        res.data.data.status = "临时封禁";
                        break;
                    case "3":
                        res.data.data.status = "永久封禁";
                        break;
                    case "4":
                        res.data.data.status = "临时封禁且不在群聊";
                        break;
                    default:
                        break;
                }
                that.info = res.data.data;
                that.isShow = true;
            })
        }
    }
})