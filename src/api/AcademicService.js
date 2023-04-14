import express from "express";
import jsonResponse from "@/utils/json";

const Router = express.Router();

/* * * GET * * */
Router.get("/get-all", (req, res, next) => {
    console.log("Testing from Academic controller");
    jsonResponse({ req, res }).success({ statusCode: 200, message: "Testing from Academic controller" });
});

/* * * POST * * */

/* * * DELETE * * */

/* * * PUT * * */

export default Router;
