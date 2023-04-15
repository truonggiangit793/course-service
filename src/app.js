import ip from "ip";
import http from "http";
import express from "express";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import jsonResponse from "@/utils/json";
import RouteInitializer from "@/routes/index";
import MongoDBConnection from "@/configs/db";
import logger from "@/services/logger";

const app = express();
const port = normalizePort(process.env.PORT || 3000);
const debug = require("debug")("server");

app.use(logger.log);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

MongoDBConnection();
RouteInitializer(app);

app.use(function (req, res, next) {
    return next(createError(404));
});

app.use(function (error, req, res, next) {
    res.locals.message = error.message;
    res.locals.error = req.app.get("env") === "development" ? error : {};
    logger.error({ req, res, error });
    return jsonResponse({ req, res }).failed({ statusCode: error.status || 500, message: error.message || "Internal Server Error", errors: error || null });
});

app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
}

function onError(error) {
    if (error.syscall !== "listen") throw error;
    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log("\x1b[36m%s\x1b[0m", ">>>>>> Local address: " + "http://localhost:" + port);
    console.log("\x1b[36m%s\x1b[0m", ">>>>>> Network address: " + "http://" + ip.address() + ":" + port);
    debug("Listening on " + bind);
}
