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
    console.log(user);
}


let cntQ = 1;
let shareLink = "";
const newQ = function() {
    let c = document.getElementById("d1");
    let d = c.cloneNode(true);
    cntQ++;
    d.setAttribute("id", `d${cntQ}`);
    document.getElementById("QQ").appendChild(d);
}
const submit = function() {
    let p = {
        "id": user.id,
        "name": document.getElementById("name").value,
        "time": document.getElementById("time").value,
        "description": document.getElementById("des").value
    }
    let arr = []
    for (let i = 0; i < cntQ; i++) {
        arr.push(document.getElementsByClassName("question")[i].value);
    }
    p["question"] = arr;
    request("POST", `${backUrl}/create_event`, JSON.stringify(p), (http) => {
        http.setRequestHeader('Content-type', 'application/json');
      }, (http) => {
        let code = http.responseText;
        let n = document.createElement("a");
        let br = document.createElement("br");
        n.href = `${location.origin}/join.html?code=${code}`
        shareLink = `Join my event at https://liff.line.me/${user.liffid}/join.html?code=${code}`;
        n.innerText = '\n' + shareLink;
        document.getElementById("body").appendChild(br);
        document.getElementById("body").appendChild(n);
        show(document.getElementById("STL"));
      })
}
const share = function() {
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
const show = function(item) {
    item.style.display = "block";
}