import jsonResponse from "@/utils/json";
import configs from "@root/env.config";

export default function (req, res, next) {
    return next();
    const apiKey = req.query.api_key;
    if (!apiKey) return jsonResponse({ req, res }).failed({ statusCode: 401, message: "API key must be provided." });
    if (configs.SERVICE_KEY.includes(apiKey)) return next();
    return jsonResponse({ req, res }).failed({ statusCode: 401, message: "Invalid API key." });
}
