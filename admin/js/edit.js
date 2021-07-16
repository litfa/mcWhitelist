// const { default: axios } = require("axios");

// const { default: axios } = require("axios");

// window.onload = () => {
var app = new Vue({
    el: "#app",
    data: {
        info: [],
        banTime: 24,
        banText: ""
    },
    created: function () {
        this.find();
    },
    methods: {
        getValue: function (name) {
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

        },
        removeWl: function () {
            var that = this;
            var num = Math.floor(Math.random() * 10);
            var num2 = Math.floor(Math.random() * 10);
            var num3 = window.prompt(`确定要删除吗? ${num} + ${num2} = ？`);
            if (num + num2 == num3) {
                axios.post("/api/admin/removeWl", {
                    _id: that.info._id
                }).then(doc => {
                    if (doc.data.status == 200) {
                        alert("删除成功!");
                        window.close();
                    } else {
                        console.log(doc.data);
                        alert(`删除失败\n${doc.data.status}`);
                    }
                }).catch(err => {
                    console.log(err);
                    alert(`删除失败\n${doc.data.status}`);
                })
            }
        },
        ban: function () {
            let banTime = this.banTime * 60 * 60 * 1000;
            var that = this;
            axios.post("/api/admin/ban", {
                time: banTime,
                text: that.banText,
                _id: that.info._id
            })
        }
    }
})
