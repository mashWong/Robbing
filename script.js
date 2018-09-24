console.log("插件已运行");
let wUrl = window.location.href.toString();
if (wUrl.indexOf("_delete_word") !== -1) {
    chrome.runtime.sendMessage({cmd: new Date().getTime()});
    window.location.href = wUrl.replace("_delete_word", "");
}
let isGo = true, isDown = true, num = 1;
let isSubmit = false; //是否抢到单
let code = null; //页面编码
let password = null; //支付密码
let isStop = false;

// async
async function ajax_get(url, index) {
    if(isStop) return;
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
            // console.log(ajax.responseText);//输入相应的内容
            isGo = false;
            if (!isSubmit && ajax.responseText.length > 500) {
                let as = "<form" + ajax.responseText.toString().split("<form")[1];
                let sa = as.split("</form>")[0] + "</form>";
                // 开始支付
                console.log(new Date().getTime());
                chrome.runtime.sendMessage({cmd: new Date().getTime()});
                pay(sa);
            } else {
                if(index === 199){
                    num++;
                    start(code);
                }
                // console.log(ajax.responseText);
            }
        }
    };
}

// 支付订单
function pay(text) {
    text = text.replace('name="submit"', 'name="submit_delete_word"');
    let objE = document.createElement("div");
    objE.innerHTML = text;

    let form = objE.children[0];
    document.body.appendChild(form);
    form[2].defaultValue = 1;
    form[7].defaultValue = password;
    // chrome.runtime.sendMessage({cmd: "已停止！！共发起" + num*200 + "个请求, 支付耗时：" + new Date().getTime()});
    form.submit();

    // jq的Ajax提交
    // $.ajax({
    //     url: "http://www.nilaidang.com/order/order-reserve-" + code + ".html",
    //     data: $(form).serialize(),
    //     // data: {
    //     //     payment: 2,
    //     //     submit: 1,
    //     //     token: "7efbdaa4bda12c49b3601c75602729d9",
    //     //     md5: "",
    //     //     account: "",
    //     //     price: "",
    //     //     payword: form[7].defaultValue,
    //     // },
    //     type: "get",
    //     contentType: "x-www-form-urlencoded",
    //     processData: false,
    //     success: function (info) {
    //         console.log(new Date().getTime());
    //         console.log(info);
    //         // if (info === "success") {
    //         //     alert("成功上传");
    //         // } else {
    //         //     alert(info);
    //         // }
    //     }
    // });

    // 新建form发起请求
    // let list = ["payment", "submit_delete_word", "token", "md5", "account", "price", "payword"];
    //
    // let form = document.createElement('form');
    // form.action = 'http://www.nilaidang.com/order/order-reserve-31017.html';
    // form.method = 'get';
    // for (let i = 0; i < 7; i++) {
    //     let input = document.createElement('input');
    //     input.type = 'hidden';
    //     input.name = list[i];
    //     if (i === 0) {
    //         input.value = 2;
    //     } else if (i === 1) {
    //         input.value = 1;
    //     } else if (i === 6) {
    //         input.value = password;
    //     } else {
    //         input.value = objE.children[0][i + 1].value;
    //     }
    //     form.appendChild(input);
    // }
    // document.body.appendChild(form);
    // form.submit();

    isSubmit = true;
}

// 接受消息
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if(request.msg === "stop"){
            isStop = true;
            sendResponse({msg: "已停止！！共发起" + num*200 + "个请求"});
        } else {
            code = request.msg.code;
            password = request.msg.password;
            // 抢单
            start(code);
            sendResponse({msg: "监听中……"});
        }
    });

// 发送消息
// chrome.runtime.sendMessage({cmd: "已停止"});

function start(code) {
    for (let i = 0; i < 1; i++) {
        // console.log(!isStop && i === 199);
        // if(!isStop && i === 199) {
        //     // start(code);
        // }
        // setTimeout(function () {
        //     ajax_get("http://www.nilaidang.com/order/order-reserve-" + code + ".html", i);
        // }, 500);
        ajax_get("http://www.nilaidang.com/order/order-reserve-" + code + ".html", i).then();
    }
}