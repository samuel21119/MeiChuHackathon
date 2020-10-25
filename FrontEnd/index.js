const express = require("express");
const port = process.env.PORT || 8000;

let app = express();
app.use(express.static("public"));

app.listen(port, () => console.log(`app listening on port ${port}!`));
