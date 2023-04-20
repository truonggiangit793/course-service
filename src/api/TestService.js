import express from "express";
import jsonResponse from "@/utils/json";
const Router = express.Router();

/* * * GET * * */
Router.get("/", function (req, res, next) {
    return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Test service is running..." });
});

export default Router;
