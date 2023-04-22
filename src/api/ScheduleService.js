import express from "express";
import jsonResponse from "@/utils/json";
import scheduleModel from "@/models/schedule";
import courseModel from "@/models/course";
import semesterModel from "@/models/semester";
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
    const courseQuery = await courseModel.findOneByCode({ code: courseCode });
    const semesterQuery = await semesterModel.findOneByAlias({ alias: semesterAlias });
    if (!courseQuery) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Course record with course code " + courseCode + " is invalid." });
    if (!semesterQuery) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Semester with alias " + semesterAlias + " is invalid." });
    const courseData = await scheduleModel.findOne({ courseCode, semesterAlias, classId, groupId });
    if (courseData) {
        return jsonResponse({ req, res }).failed({ statusCode: 200, message: "This schedule for course with course code " + courseCode + " is duplicated." });
    }
    console.info({ courseData });
    res.end("Hello");
});

export default Router;
