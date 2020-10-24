const fs = require("fs");
const path = require("path");
const express =  require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require("./config.json");
var eventData = require("./database/event-data.json")
var userData = require("./database/user-data.json")

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get(/.*/, (req, res, next) => {
    console.log(req.url);
    var fname = req.url;
    fname = fname.slice((fname.lastIndexOf(".") - 1 >>> 0) + 2);
    console.log(fname);
    if (fname === "css" || fname === "js" || fname === "html") {
        res.sendFile(path.join(__dirname, "webpage", req.url));
    }
    else
        next();
});
app.get("/create-event", (req, res) => {
    res.sendFile(path.join(__dirname, "webpage", "create-event", "index.html"));
})
app.post("/create-event/api", (req, res) => {
    const currentEventData = req.body;
    console.log(currentEventData);
    var currentEventCode = getRandomInt();
    while (eventData[currentEventCode])
        currentEventCode = getRandomInt();
    eventData[currentEventCode] = currentEventData;
    userData[currentEventCode] = {};
    writeDatabase();
    res.send(`${currentEventCode}`);
});
app.get("/signup-event/:id(\\d+)", (req, res) => {
    res.sendFile(path.join(__dirname, "webpage", "signup-event", "index.html"));
})
app.get('/signup-event/api/:id(\\d+)', (req, res) => {
    const eventCode = req.params.id;
    try {
        const re = JSON.stringify(eventData[eventCode]);
        res.send(re);
    }catch (e) {
        res.send("null");
    }
});
app.post('/signup-event/api/:id(\\d+)', (req, res) => {
    try {
        const eventID = req.params.id;
        console.log(req.body);
        const userID = req.body.userID;
        const userForm = req.body.question;
        userData[eventID][userID] = userForm;
        writeDatabase();
        res.send("success");
    }catch(e) {
        res.send("failed");
    }
});
app.get('/query-user-event/', (req, res) => {
    res.sendFile(path.join(__dirname, "webpage", "query-user-event", "index.html"));
});
app.get('/query-user-event/api', (req, res) => {
    try {
        const userID = req.query.userID;
        var events = [];
        for (i in userData) {
            console.log(i);
            if (userData[i][userID]) {
                events.push({
                    "eventID": i,
                    "time": eventData[i]["time"],
                    "title": eventData[i]["title"],
                    "description": eventData[i]["description"]
                });
            }
        }
        events.sort((a, b) => {
            if (a["time"] > b["time"])
                return 1;
            return -1;
        })
        res.send(JSON.stringify(events));
    }catch(e) {
        res.send("null");
    }
});

writeDatabase();
app.listen(config["Web-port"], () => console.log(`Application listening on port ${config["Web-port"]}!`));

function writeDatabase() {
    fs.writeFile(path.join("database", "event-data.json"), JSON.stringify(eventData, null, "  "), (err) => {
        if (err)
            console.log(err);
    })
    fs.writeFile(path.join("database", "user-data.json"), JSON.stringify(userData, null, "  "), (err) => {
        if (err)
            console.log(err);
    })
}

function getRandomInt(max = 1000000) {
  return Math.floor(Math.random() * Math.floor(max));
}
