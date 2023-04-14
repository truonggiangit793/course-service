import path from "path";
import express from "express";

const Router = express.Router();

Router.get("/", (req, res, next) => {
    return res.sendFile(path.join(__dirname, "../", "../", "src", "logs", "logs.txt"));
});

export default Router;
