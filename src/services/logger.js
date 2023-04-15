import fs from "fs";
import logger from "morgan";

const logFilePath = "./src/logs";
const logFile = "./src/logs/server.log";

module.exports = {
    log: logger(function (tokens, req, res) {
        const date = new Date(tokens.date());
        const method = tokens.method(req, res);
        const url = tokens.url(req, res);
        const time = date.toLocaleDateString() + " - " + date.toLocaleTimeString();
        const status = tokens.status(req, res);
        const userAgent = req.headers["user-agent"];
        const responseTime = tokens["response-time"](req, res);
        const response = `>>>>>> ${time} ${method}[${status}]: ${url} ${responseTime}ms - ${userAgent}`;
        if (!fs.existsSync(logFilePath)) fs.mkdir(logFilePath, { recursive: true }, (err) => {});
        fs.readFile(logFile, (err, data) => {
            if (err) return fs.writeFile(logFile, response + "\n", (err) => {});
            return fs.appendFile(logFile, response + "\n", (err) => {});
        });
        return response;
    }),
    error: function ({ req, res, error }) {
        console.error({ error });
        const date = new Date();
        const method = req.method;
        const url = req["_parsedUrl"].path;
        const time = date.toLocaleDateString() + " - " + date.toLocaleTimeString();
        const status = error.status;
        const response = `>>>>>> ${time} ${method}[${status}] : ${url}: ERROR: ${error.message} \n ${error.stack}`;
        if (!fs.existsSync(logFilePath)) fs.mkdir(logFilePath, { recursive: true }, (err) => {});
        fs.readFile(logFile, (err, data) => {
            if (err) return fs.writeFile(logFile, response + "\n", (err) => {});
            return fs.appendFile(logFile, response + "\n", (err) => {});
        });
    },
};
