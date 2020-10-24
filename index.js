const fs = require("fs");
const path = require("path");
const cors = require('cors');
const express =  require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const LIFF_ID = process.env.LIFF_ID;
const port = process.env.PORT || 8000;
let eventData = require("./database/eventData.json")
let userData = require("./database/userData.json")

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.get('/liff-id', function(req, res) {
    res.json({liffId: LIFF_ID});
});

app.get("/account_type", (req, res) => {
    const id = req.query.id;
    if (userData.hasOwnProperty(id)) {
        res.send(userData[id]["type"]);
    }else {
        res.send("0");
    }
});
// /account_exist/?id=USER_ID

app.post("/account_reg", (req, res) => {
    const form = req.body;
    const id = form["id"];
    const type = form["type"];
    userData[id] = {
        "type": type,
        "event": []
    };
    writeDatabase();
    res.send("ok");
});
/*
 * {
 *   id: USER_ID,
 *   type: 1 or 2 (1 -> PER, 2 -> ORG)
 * }
 */

app.post("/create_event", (req, res) => {
    const form = req.body;
    let eventCode = getRandomInt();
    while (eventData.hasOwnProperty(eventCode))
        eventCode = getRandomInt();

    eventCode = String(eventCode);
    userData[form["id"]]["event"].push(eventCode);
    eventData[eventCode] = form;
    eventData[eventCode]["reg"] = {};
    eventData[eventCode]["checkin"] = [];
    writeDatabase();
    res.send(`${eventCode}`);
})
/*
 * {
 *   id: USER_ID(ORG),
 *   time: EVENT_TIME (20201025),
 *   name: EVENT_NAME,
 *   description: xxx,
 *   question: ["Q1", "Q2" ...]
 * }
 */

app.get("/reg_event", (req, res) => {
    const code = req.query.code;
    let re = {
        "name": eventData[code]["name"],
        "description": eventData[code]["description"],
        "time": eventData[code]["time"],
        "question": eventData[code]["question"]
    };
    res.json(re);
})
// /reg_event/?code=EVENT_CODE

app.post("/reg_event", (req, res) => {
    const form = req.body;
    const id = form["id"];
    const code = form["code"];
    const question = form["question"];
    eventData[code]["reg"][id] = question;
    userData[id]["event"].push(code);
    writeDatabase();
    res.send("ok");
})
/*
 * {
 *   id: USER_ID(PER),
 *   code: EVENT_CODE,
 *   question: {
 *     "Q1": "A1",
 *     "Q2": "A2"
 *   }
 * }
 */

app.get("/query_event", (req, res) => {
    const id = req.query.id;
    const isORG = userData[id]["type"] == "2";
    let re = [];
    userData[id]["event"].forEach((elem) => {
        let toPush = {
            "code": elem,
            "time": eventData[elem]["time"],
            "name": eventData[elem]["name"],
            "description": eventData[elem]["description"]
        };
        if (isORG) {
            toPush["reg"] = String(Object.keys(eventData[elem]["reg"]).length),
            toPush["checkin"] = String(Object.keys(eventData[elem]["checkin"]).length)
        }
        re.push(toPush);
    })
    re.sort((a, b) => {
        if (a["time"] > b["time"])
            return 1;
        return -1;
    })
    res.json(re);
})
// /query_event/?id=USER_ID

app.post("/unreg_event", (req, res) => {
    const form = req.body;
    const id = form["id"];
    const code = form["code"];
    userData[id]["event"].splice(userData[id]["event"].indexOf(code), 1);
    delete eventData[code]["reg"][id];
    writeDatabase();
    res.send("ok");
})
/*
 * {
 *   id: USER_ID,
 *   code: EVENT_CODE
 * }
 */

app.post("/delete_event", (req, res) => {
    const form = req.body;
    const id = form["id"];
    const code = form["code"];
    for (const [regID, value] of Object.entries(eventData[code]["reg"])) {
        userData[regID]["event"].splice(userData[regID]["event"].indexOf(code), 1);
    }
    console.log(userData[id]["event"].indexOf(code));
    userData[id]["event"].splice(userData[id]["event"].indexOf(code), 1);
    console.log(userData[id]["event"]);
    delete eventData[code];
    writeDatabase();
    res.send("ok");
})
/*
 * {
 *   id: USER_ID,
 *   code: EVENT_CODE
 * }
 */

app.get("/checkin", (req, res) => {
    const id = req.query.id;
    const code = req.query.code;
    eventData[code]["checkin"].push(id);
    writeDatabase();
    res.send("Check in success");
})
// /checkin&id=USER_ID&code=EVENT_CODE

function writeDatabase() {
    fs.writeFile(path.join("database", "eventdata.json"), JSON.stringify(eventData, null, "  "), (err) => {
        if (err)
            console.log(err);
    })
    fs.writeFile(path.join("database", "userdata.json"), JSON.stringify(userData, null, "  "), (err) => {
        if (err)
            console.log(err);
    })
}

function getRandomInt(max = 1000000) {
  return Math.floor(Math.random() * Math.floor(max));
}

app.listen(port, () => console.log(`app listening on port ${port}!`));

