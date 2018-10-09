console.log("插件开始");
window.sum = function (text) {
    let code = document.getElementById("code").value;
    let password = document.getElementById("password").value;
    let obj = {
        code: code,
        password: password
    };
    if (text === "stop") obj = "stop";
    chrome.tabs.query(
        {active: true, currentWindow: true},
        function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {msg: obj},
                function (response) {
                    document.getElementById("statue").innerText = response.msg;
                });
        });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.cmd){
        document.getElementById("statue").innerText = request.cmd;
        console.log(request.cmd);
    }
});