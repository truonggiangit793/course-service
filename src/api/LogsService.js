import path from "path";
import express from "express";

const Router = express.Router();

Router.get("/", (req, res, next) => {
    const logFile = "server.log";
    return res.sendFile(path.join(__dirname, "../", "../", "src", "logs", logFile));
});

export default Router;
