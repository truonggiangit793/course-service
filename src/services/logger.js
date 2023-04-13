import fs from "fs";
import logger from "morgan";

const logFilePath = "./src/logs/logs.txt";

export default logger(function (tokens, req, res) {
    const date = new Date(tokens.date());
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const time = date.toLocaleTimeString() + " - " + date.toLocaleDateString();
    const status = tokens.status(req, res);
    const userAgent = req.headers["user-agent"];
    const responseTime = tokens["response-time"](req, res);
    const response = `>>>>>> ${time} ${method}[${status}]: ${url} ${responseTime}ms - ${userAgent}`;
    fs.appendFile(logFilePath, response + "\n", (err) => {
        if (err) throw err;
    });
    return response;
});
