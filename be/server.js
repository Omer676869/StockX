const express = require("express");
const app = express();
const path = require("path");
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../fe")));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.get("/get", (req, res) => {
    console.log("GET request data:", req.query);
    res.send("GET request התקבל!");
});

app.post("/submit", (req, res) => {
    console.log("POST request data:", req.body);
    res.send("Form data received");
});


app.listen(port, () => {
    console.log(`השרת רץ: http://localhost:${port}`);
});