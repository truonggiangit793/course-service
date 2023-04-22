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
    const { error } = scheduleSchema.scheduleSchema.validate(req.body);
    if (error) return next(error);

    const { courseCode, semesterAlias, groupId, limit, periods, weeks, day } = req.body;
    const courseQuery = await courseModel.findOneByCode({ code: courseCode });
    const semesterQuery = await semesterModel.findOneByAlias({ alias: semesterAlias });

    if (!courseQuery) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Course record with course code " + courseCode + " is invalid." });
    if (!semesterQuery) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Semester with alias " + semesterAlias + " is invalid." });

    const classId = `${courseCode}-${semesterAlias}`;
    const courseData = await scheduleModel.findOne({ courseCode, semesterAlias, classId, groupId });

    if (courseData) {
        return jsonResponse({ req, res }).failed({ statusCode: 200, message: "This schedule for course with course code " + courseCode + " is duplicated." });
    } else {
        scheduleModel.createOne({ courseCode, semesterAlias, classId, groupId, limit, periods, weeks, day }, (error, result) => {
            if (error) return next(error);
            return jsonResponse({ req, res }).failed({ statusCode: 200, message: "A schedule for course with course code " + courseCode + " is created." });
        });
    }
});

Router.post("/enroll", async function (req, res, next) {
    const { error } = scheduleSchema.scheduleEnrollment.validate(req.body);
    if (error) return next(error);

    const { studentId, courseCode, semesterAlias, groupId } = req.body;
    const courseQuery = await courseModel.findOneByCode({ code: courseCode });
    const semesterQuery = await semesterModel.findOneByAlias({ alias: semesterAlias });

    if (!courseQuery) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Course record with course code " + courseCode + " is invalid." });
    if (!semesterQuery) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Semester with alias " + semesterAlias + " is invalid." });

    const classId = `${courseCode}-${semesterAlias}`;

    const scheduleData = await scheduleModel.findOne({ courseCode, semesterAlias, classId, groupId });
    if (!scheduleData) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "This schedule cannot be found." });
    if (!scheduleData.registrationAllowed) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "You do not have permission to enroll this class." });
    if (scheduleData.studentMember.includes(studentId)) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "You have been enrolled this class before." });
    if (scheduleData.studentMember.length == scheduleData.limit)
        return jsonResponse({ req, res }).failed({ statusCode: 200, message: "This class has been fulled with students." });

    scheduleModel.enroll({ studentId, courseCode, semesterAlias, classId, groupId }, (error, result) => {
        if (error) return next(error);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: "You have been enrolled to this class." });
    });
});

export default Router;
