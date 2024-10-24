const express = require("express");

const app = express();

let vPageExtension = "";

app.get("/:page", (req, res) => {
    if (req.params.page.indexOf("favicon.ico") == -1) {
        if (req.params.page.indexOf('.html') == -1) vPageExtension = '.html';
        res.sendFile(__dirname + '/html/' + req.params.page + vPageExtension);
        vPageExtension = '';
    }
});

app.get("/:path1/:page", (req, res) => {
    if (req.params.page.indexOf("favicon.ico") == -1) {
        if (req.params.page.indexOf('.js') > -1) {
            res.sendFile(__dirname + '/' + req.params.path1 + '/' + req.params.page);
        } else if (req.params.page.indexOf('.css') > -1) {
            res.sendFile(__dirname + '/' + req.params.path1 + '/' + req.params.page);
        }
    }
});

app.listen(3000, () => { });