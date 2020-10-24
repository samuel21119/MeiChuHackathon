const fs = require("fs");
const path = require("path");
const cors = require('cors');
const express =  require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const LIFF_ID = process.env.LIFF_ID;
const port = process.env.PORT || 8000;
var eventData = require("./database/event-data.json")
var userData = require("./database/user-data.json")

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.get('/liff-id', function(req, res) {
    res.json({liffId: LIFF_ID});
});
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "webpage", "index.html"));
})

app.use(express.static("webpage"));
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
        res.json(eventData[eventCode]);
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
app.get('/query-user-event', (req, res) => {
    console.log(123);
    try {
        const userID = req.query.userID;
        console.log(userID);
        var events = [];
        for (i in userData) {
            console.log(i);
            if (userData[i][userID]) {
                events.push({
                    "id": i,
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
        res.json(events);
    }catch(e) {
        console.log(e);
        res.send("null");
    }
});

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

app.listen(port, () => console.log(`app listening on port ${port}!`));

