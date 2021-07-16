//version:test1.2
var timu = document.getElementById("timu"),
	XvanXiang = "";
for (i = 0; i < q.length; i++) {
	var num = i + 1,
		title = q[i][0],
		XvanXiangA = q[i][1],
		XvanXiangB = q[i][2],
		XvanXiangC = q[i][3],
		XvanXiangD = q[i][4];
	XvanXiang += "<div class='q'><span>" + num + "</span><div>" + title + "</div><label for='q" + num + "A'><input type='radio' name='q" + num + "' id='q" + num + "A' value='A'>" + XvanXiangA + "</label><label for='q" + num + "B'><input type='radio' name='q" + num + "' id='q" + num + "B' value='B'>" + XvanXiangB + "</label><label for='q" + num + "C'><input type='radio' name='q" + num + "' id='q" + num + "C' value='C'>" + XvanXiangC + "</label><label for='q" + num + "D'><input type='radio' name='q" + num + "' id='q" + num + "D' value='D'>" + XvanXiangD + "</label></div>";
	// console.log(XvanXiang);
};
timu.innerHTML = XvanXiang;


