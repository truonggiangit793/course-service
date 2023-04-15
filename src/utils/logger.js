import util from "util";
import fs from "fs";
import logger from "morgan";
import moment from "moment";

const logFilePath = "./src/logs";
const logFile = "./src/logs/server.log";

if (!fs.existsSync(logFilePath)) fs.mkdir(logFilePath, { recursive: true }, (err) => {});

module.exports = {
    config: function (logs) {
        const logLine = ">>>> " + moment().format("DD/MM/YYYY|hh:mm:ssA| ") + logs;
        const stack = logs.stack ? logLine + "\n" + logs.stack : logLine;
        fs.readFile(logFile, (err, data) => {
            if (err) return fs.writeFile(logFile, util.format(stack) + "\n", (err) => {});
            return fs.appendFile(logFile, util.format(stack) + "\n", (err) => {});
        });
        process.stdout.write(util.format(stack) + "\n");
    },
    morgan: logger(function (tokens, req, res) {
        const method = tokens.method(req, res);
        const url = tokens.url(req, res);
        const status = tokens.status(req, res);
        const userAgent = req.headers["user-agent"];
        const responseTime = tokens["response-time"](req, res);
        const response = `${method}[${status}]: ${url} - ${responseTime}ms - ${userAgent}`;
        console.log(response);
    }),
};
