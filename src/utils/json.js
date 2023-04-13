export default function ({ req, res }) {
    const json = {
        success: ({ statusCode = 200, message = "Default message!", data = null, errors = null }) => {
            json.handleError({ statusCode, message, data, errors });
            json.send({ status: true, statusCode, message, data, errors });
        },
        failed: ({ statusCode = 500, message = "Default message!", data = {}, errors = {} }) => {
            json.handleError({ statusCode, message, data, errors });
            json.send({ status: false, statusCode, message, data, errors });
        },
        send: ({ status, statusCode, message, data, errors }) => {
            const requestURL = `${req.protocol}://${req.rawHeaders[1]}${req.originalUrl}`;
            const timestamp = new Date().getTime();
            res.status(statusCode).json({ status, statusCode, message, data, errors, requestURL, timestamp });
        },
        handleError: ({ statusCode, message, data, errors }) => {
            if (typeof statusCode != "number") throw new Error("Http status code must be a number.");
            if (typeof message != "string") throw new Error("Type of message must be a string.");
            if (typeof data != "object") throw new Error("Type of data must be an object.");
            if (typeof errors != "object") throw new Error("Type of errors must be an object.");
        },
    };
    return { success: json.success, failed: json.failed };
}
