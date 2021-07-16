const mongoose = require("mongoose");

const moonboos = new mongoose.Schema({
	// userName: {
    //     type: String,
    //     required: true,
    //     maxlength:20
    // },
    // 提交名
    // 玩家id	xuid	qq	信誉分	状态	备注
	name: {
		type: String,
		// required: true,
		unique:true,
	},
	xuid: {
		type: String
	},
	qq: {
		type: Number,
		required: true,
		unique: true,
	},
	credit: {
		type: Number,
		// required: true,
		default: 12
	},
	status: {
		type: String,
		default: "正常"
	},
	remarks: {
		type: [Object]
	},
	unbanTime: {
		type: String
	}
});
const moon = mongoose.model("Moon",moonboos);

module.exports = moon;