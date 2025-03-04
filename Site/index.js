// Libraries
const { createServer } = require("http");
const express = require("express");

// App
const app = express();

// App Helpers
app.use(express.static(__dirname + "/web/assets"));
app.set("views", "./web/frontend");
app.set("view engine", "ejs");

app.all("*", function(request, response) {
    return response.render("index")
});

createServer(app).listen(7331, () => {
    app.disable("x-powered-by") && app.disable("etag") && app.disable("date");

    console.log("[\x1b[33m?\x1b[37m] Started site\n");
});