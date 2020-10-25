const backUrl = "https://a36809060763.ngrok.io";
const code = (new URLSearchParams(window.location.search)).get("code");
let user = {
    role: "",
    id: "",
    name: ""
}

const request = (method, url, par, setting, callback) => {
    var http = new XMLHttpRequest();
    http.open(method, url, true);
    if (typeof(setting) === "function")
      setting(http);
    http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
            callback(http);
        }
    };
    http.send(par);
}
let cntQ = 0;
request("GET", `${backUrl}/reg_event?code=${code}`, undefined, undefined, (http) => {
    const recv = JSON.parse(http.responseText);
    document.getElementById("name").innerText = recv["name"];
    document.getElementById("time").innerText = recv["time"];
    document.getElementById("des").innerText = recv["description"];
    cntQ = recv["question"].length;
    console.log(cntQ);
    document.getElementById("q1").innerText = recv["question"][0];
    for (let i = 2; i <= cntQ; i++) {
        let a = document.createElement("div");
        let b = document.createElement("span");
        b.setAttribute("id", `d${i}`);
        b.innerText = recv["question"][i - 1];
        let c = document.createElement("input");
        c.setAttribute("type", "text");
        c.setAttribute("name", "question");
        c.setAttribute("class", "question");
        a.appendChild(b);
        a.appendChild(c)
        // d.getElementsByTagName("span")[0].innerText = recv["question"][i - 1];
        // d.getElementsByTagName("span")[0].setAttribute("id", `q${i}`);
        document.getElementById("QQ").appendChild(a);
    }
})

// Get LIFF-ID
request("GET", `${backUrl}/liff-id`, undefined, undefined, (http) => {
    const liffid = JSON.parse(http.responseText);
    liff.init(liffid).then(() => {
        if (!liff.isLoggedIn())
            liff.login();
        else
            main();
    })
})

const main = function() {
    const token = liff.getDecodedIDToken();
    user.id = token.sub;
    user.name = token.name;
    //request("GET", `${backUrl}/reg_event?code=${code}`)
}


const submit = function() {
    let p = {
        "id": user.id,
        "code": code
    }
    let arr = []
    for (let i = 0; i < cntQ; i++) {
        arr.push(document.getElementsByClassName("question")[i].value);
    }
    p["question"] = arr;
    request("POST", `${backUrl}/reg_event`, JSON.stringify(p), (http) => {
        http.setRequestHeader('Content-type', 'application/json');
      }, (http) => {
        let status = http.responseText;
        console.log(status);
        let n = document.createElement("div");
        let br = document.createElement("br");
        n.innerText = "註冊成功，點擊 Event Do 返回主頁";
        document.getElementById("body").appendChild(br);
        document.getElementById("body").appendChild(n);
      })
}