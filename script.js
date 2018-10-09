console.log("插件已运行");
let isGo = true, num = 1;
let isSubmit = false; //是否抢到单
let code = null; //页面编码
let password = null; //支付密码
let isStop = false;
let lastTime = 0, startTime = 0, waitTime = 0;
let controller = new AbortController();
let signal = controller.signal;

// async
function ajax_get(url) {
    if (isStop) return;
    // if (!isSubmit) { start(code); }
    // 步骤一:创建异步对象
    let ajax = new XMLHttpRequest();
    // 步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
    ajax.open('get', url);
    // 步骤三:发送请求
    ajax.setRequestHeader("content-type", "x-www-form-urlencoded");
    ajax.send();
    // 步骤四:注册事件 onreadystatechange 状态改变就会调用
    ajax.onreadystatechange = function () {
        if (ajax.readyState === 4 && ajax.status === 200) {
            //步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
            isGo = false;
            if (!isSubmit && ajax.responseText.length > 500) {
                // 开始支付
                lastTime = new Date().getTime();
                pay(getVal(ajax.responseText.toString(), "<form", "</form>"));
            } else {
                if (!isSubmit) {
                    num++;
                    start(code);
                } else if (isSubmit) {
                    isStop = true;
                }
            }
        }
    };
}

// 截取关键值
function getVal(text, str1, str2) {
    return text.split(str1)[1].split(str2)[0];
}

// 支付订单
function pay(text) {
    let _url = "http://www.nilaidang.com/order/order-reserve-" + code + ".html?" +
        "payment=2&submit=1&token=" + getVal(text, 'name="token"  value="', '" />')
        + "&md5=" + encodeURIComponent(getVal(text, 'name="md5"  value="', '" />'))
        + "&account=" + getVal(text, 'name="account" value="', '" id="account"')
        + "&price=" + getVal(text, 'name="price"  value="', '" id="price"')
        + "&payword=" + password;

    window.location.assign(_url);
    // waitTime = new Date().getTime();
    // console.log("开始支付，耗时：" + (waitTime - startTime));
    // // jq的Ajax提交
    // $.ajax({
    //     url: "http://www.nilaidang.com/order/order-reserve-" + code + ".html",
    //     data: "payment=2&submit=1&token=" + getVal(text, 'name="token"  value="', '" />')
    //         + "&md5=" + encodeURIComponent(getVal(text, 'name="md5"  value="', '" />'))
    //         + "&account=" + getVal(text, 'name="account" value="', '" id="account"')
    //         + "&price=" + getVal(text, 'name="price"  value="', '" id="price"')
    //         + "&payword=" + password,
    //     type: "get",
    //     contentType: "x-www-form-urlencoded",
    //     processData: false,
    //     success: function (info) {
    //         isSubmit = true;
    //         // console.log("支付消耗：" + (new Date().getTime() - lastTime));
    //         console.log("等待支付时长：" + (new Date().getTime() - waitTime));
    //         console.log("总耗时：" + (new Date().getTime() - startTime));
    //         let reg = /[\u4e00-\u9fa5]/g;
    //         // console.log(info.toString().match(reg).join(""));
    //         chrome.runtime.sendMessage({cmd: info.match(reg).join("") + "   等待支付时长:" + (new Date().getTime() - waitTime)});
    //     }
    // });
    // isSubmit = true;
}

// 接受消息
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.msg === "stop") {
            isStop = true;
            sendResponse({msg: "已停止！！共发起" + (num*200) + "个请求"});
        } else {
            code = request.msg.code;
            password = request.msg.password;
            // 抢单
            sendResponse({msg: "初始化中，请耐心等待……"});
            start(code);
        }
    });

async function fetch_get(url, index){
    if (isStop) return;
    if (isSubmit) return;
    // if (!isSubmit) start(code);
    fetch(url).then((res)=>{ //返回请求状态
        return res.text()
    }).then((res) => { //返回请求结果
        isGo = false;
        if (index === 0) {
            console.log("初始化完成");
        }
        if (!isSubmit && res.length > 500) {
            lastTime = new Date().getTime();
            console.log("下订单， index为" + index + "");
            pay(getVal(res.toString(), "<form", "</form>"));
        } else {
            if (index === 199) {
                num++;
                start(code);
            }
        }
    })
}

function start(code) {
    startTime = new Date().getTime();
    let URL = "http://www.nilaidang.com/order/order-reserve-" + code + ".html";
    for (let i = 0; i < 200; i++) {
        fetch(URL, {signal}).then((res)=>{ //返回请求状态
            return res.text()
        }).then((res) => { //返回请求结果
            isGo = false;
            // if (i === 0) console.log("初始化完成");
            if (!isSubmit && res.length > 500) {
                // controller.abort();
                lastTime = new Date().getTime();
                // console.log("下订单， index为" + i + "");
                pay(getVal(res.toString(), "<form", "</form>"));
            } else {
                if (i === 199 && !isSubmit) {
                    num++;
                    start(code);
                }
            }
        })

        // if(!isStop && i === 199) {
        //     start(code);
        // }
        //
        // fetch_get("http://www.nilaidang.com/order/order-reserve-" + code + ".html", i).then();
    }

    // ajax_get("http://www.nilaidang.com/order/order-reserve-" + code + ".html");
}