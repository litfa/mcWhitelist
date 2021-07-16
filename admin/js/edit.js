window.onload = () => {
    var app = new Vue({
        el: "#app",
        data: {
            info: []
        },
        created: function () {
            this.find();
        },
        methods: {
            getValue : function (name) {
                return decodeURIComponent(
                    (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20')) || null;
            },
            find: function () {
                let info = this.getValue("info");
                info = JSON.parse(info);
                this.info = info;
                // var that = this;
                // axios.get("/api/admin/query").then(res => {
                //     console.log(res);
                //     for (i in res.data.data) {
                //         switch (res.data.data[i].status) {
                //             case "1":
                //                 res.data.data[i].status = "正常";
                //                 break;
                //             case "0":
                //                 res.data.data[i].status = "未申请";
                //                 break;
                //             case "2":
                //                 res.data.data[i].status = "临时封禁";
                //                 break;
                //             case "3":
                //                 res.data.data[i].status = "永久封禁";
                //                 break;
                //             case "4":
                //                 res.data.data[i].status = "临时封禁且不在群聊";
                //                 break;
                //             default:
                //                 break;
                //         }
                //     }
                //     console.log(res);
                //     that.list = res.data.data;
                // }).catch(err => {
                //     console.log(err);
                // })

            }
        }
    })
}