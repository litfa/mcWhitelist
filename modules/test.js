let a = true,
    b = true,
    c = true,
    d = true,
    e = true;
console.log(a, b, c, d, e);
if (
    a &&
    b &&
    c &&
    d &&
    e
) {
    console.log("这里输出了true");
} else {
    console.log("这里输出了false");
}
console.log("------ 分割线 ------");
if (a) {
    if (b) {
        if (c) {
            if (d) {
                if (e) {
                    console.log("这里输出了true");
                } else {
                    console.log("这里输出了false");
                }
            }
        }
    }
}