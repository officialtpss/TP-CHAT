const express = require("express");
const { PORT } = require("./constant");
const { Server } = require("socket.io");
const path = require('path');
const swagger = require("./swagger");

const start = () => {

    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use('/docs', swagger.router);
    app.use('/public', express.static(path.join(__dirname, './../', 'public')));
    
    app.all("*", function (req, res, next) {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Credentials", true);
        res.set("Access-Control-Allow-Methods", "POST, GET, PUT,PATCH, DELETE");
        res.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, authorization-key,token"
        );
        if ("OPTIONS" == req.method) return res.status(200).send();
        next();
    });

    const server = require("http").createServer(app);
    const io = new Server(server, { cors: { origin: "*" } });

    app.get("/", (req, res) => {
        res.sendStatus(200);
    });

    require("./config/database")(app, io);

    server.listen(PORT);
    console.log("TP-CHAT -> RESTFUL API server started on: " + PORT);
};

start();
