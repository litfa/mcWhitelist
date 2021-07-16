// version: test1.2
window.onload = function () {
	var qqTiShi = document.getElementById("qqTiShi");
	var idTiShi = document.getElementById("idTiShi");
	console.log(idTiShi, qqTiShi);
}
function tijiao() {
	var isPass = true;
	var xboxID = document.getElementById("xboxID").value,
		qq = document.getElementById("qq").value;

	if (xboxID == "") {
		idTiShi.innerText = "请填写游戏id";
		idTiShi.style.color = "#cc0000";
		isPass = false;
	} else if (xboxID != "") {
		idTiShi.innerText = "√";
		idTiShi.style.color = "#00c000";
	}

	if (qq == "") {
		qqTiShi.innerText = "请填写qq";
		qqTiShi.style.color = "#cc0000";
		isPass = false;
	} else {
		qqTiShi.innerText = "√";
		qqTiShi.style.color = "#00c000"
		// isPass = true;
	}


	var inputlength = document.getElementsByTagName("input").length;
	var num = 0;
	for (i = 0; i < inputlength; i++) {
		var input = document.getElementsByTagName("input")[i];
		if (input.checked == 1) {
			num += 1;
		}
	}
	console.log(num);
	if (num < 20) {
		if (confirm("你有未完成的题目，确定继续吗？")) {
			isPass = false;
		} else {
			// window.open("#top");
			scrollTo(0, 0);
		}
	}

	return isPass;
}

function blurid() {
	var id = document.getElementById("xboxID").value;
	if (id == "") {
		idTiShi.innerText = "请填写游戏id";
		idTiShi.style.color = "#c00";
	} else {
		idTiShi.innerText = "√";
		idTiShi.style.color = "#00c000";
	}
	console.log("11");
}

function blurqq() {
	var qq = document.getElementById("qq").value;
	if (qq == "") {
		qqTiShi.innerText = "请填写qq";
		qqTiShi.style.color = "#c00"
	} else {
		qqTiShi.innerText = "√";
		qqTiShi.style.color = "#00c000";
	}
	console.log("21")
}