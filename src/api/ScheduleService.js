import express from "express";
import jsonResponse from "@/utils/json";
import scheduleModel from "@/models/schedule";
import courseModel from "@/models/course";
import scheduleSchema from "@/schema/schedule";

const Router = express.Router();

/* * * GET * * */
Router.get("/", function (req, res, next) {
    return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Course code has been removed." });
});

/* * * POST * * */
Router.post("/new", async function (req, res, next) {
    const { error } = scheduleSchema.validate(req.body);
    if (error) return next(error);
    const { courseCode, semesterAlias, classId, groupId, limit, studentMember, periods, weeks, day } = req.body;
    const course = await courseModel.findOneByCode({ code: courseCode });
    console.info({ course });
    return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Course code has been removed." });
});

export default Router;
