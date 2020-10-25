const backUrl = "https://a36809060763.ngrok.io";
let user = {
    role: "",
    id: "",
    name: "",
    liffid: ""
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

// Get LIFF-ID
request("GET", `${backUrl}/liff-id`, undefined, undefined, (http) => {
    const liffid = JSON.parse(http.responseText);
    user.liffid = liffid.liffId;
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
    document.getElementById("hello").innerText = `Hello: ${user.name}`;

    request("GET", `${backUrl}/account_type/?id=${user.id}`, undefined, undefined, (http) => {
        const type = http.responseText;
        if (type == "0") {
            hide(document.getElementById("loading"));
            show(document.getElementById("reg"));
        }else {
            listEvents(type);
        }
    })
}

const reg = function(role) {
    console.log(role);
    let send = {
        "id": user.id,
        "type": role
    }
    request("POST", `${backUrl}/account_reg`, JSON.stringify(send), (http) => {
          http.setRequestHeader('Content-type', 'application/json');
      }, (http) => {
        listEvents(role);
      })
}

const listEvents = function(type) {
    hide(document.getElementById("loading"));
    hide(document.getElementById("reg"));
    show(document.getElementById("menu"));
    request("GET", `${backUrl}/query_event/?id=${user.id}`, undefined, undefined, (http) => {
        const events = JSON.parse(http.responseText);
        drawCards(events, type)
    })
}

const drawCards = function(events, type) {
    for (let i = 0; i < events.length; i++) {
        let div = document.createElement("div");
        div.innerText = `活動：${events[i]["name"]} \n 時間：${events[i]["time"]}`
        if (type == "2") {
            div.innerText += `\n註冊人數: ${events[i]["reg"]}     報到人數: ${events[i]["checkin"]}`;
            shareLink = `Join my event at https://liff.line.me/${user.liffid}/join.html?code=${events[i]["code"]}`;
            div.setAttribute("onclick", `share('${shareLink}')`);
        }
        div.setAttribute("class", "card");
        document.getElementById("c").appendChild(div);
    }
    if (type == "2") {
        show(document.getElementById("regEvent"));
    }

}
const share = function(shareLink) {
    if (liff.isApiAvailable('shareTargetPicker')) {
      liff.shareTargetPicker([
        {
          'type': 'text',
          'text': shareLink
        }
      ])
        .then(function (res) {
          if (res) {
            // succeeded in sending a message through TargetPicker
            console.log(`[${res.status}] Message sent!`)
          } else {
            const [majorVer, minorVer] = (liff.getLineVersion() || "").split('.');
            if (parseInt(majorVer) == 10 && parseInt(minorVer) < 11) {
              // LINE 10.3.0 - 10.10.0
              // Old LINE will access here regardless of user's action
              console.log('TargetPicker was opened at least. Whether succeeded to send message is unclear')
            } else {
              // LINE 10.11.0 -
              // sending message canceled
              console.log('TargetPicker was closed!')
            }
          }
        }).catch(function (error) {
          // something went wrong before sending a message
          console.log('something wrong happen')
        })
    }
}
const hide = function(item) {
    item.style.display = "none";
}
const show = function(item) {
    item.style.display = "block";
}