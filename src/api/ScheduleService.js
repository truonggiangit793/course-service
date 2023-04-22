import express from "express";
import jsonResponse from "@/utils/json";
import scheduleModel from "@/models/schedule";
import courseModel from "@/models/course";
import semesterModel from "@/models/semester";
import academicModel from "@/models/academic";
import enrollmentModel from "@/models/enrollment";
import scheduleSchema from "@/schema/schedule";
import enrollmentSchema from "@/schema/enrollment";

const Router = express.Router();

/* * * GET * * */
Router.get("/", function (req, res, next) {
    return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Course code has been removed." });
});

/* * * POST * * */
Router.post("/new", async function (req, res, next) {
    const { error } = scheduleSchema.validate(req.body);
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
        scheduleModel.createOne({ courseCode, semesterAlias, groupId, limit, periods, weeks, day }, (error, result) => {
            if (error) return next(error);
            return jsonResponse({ req, res }).failed({ statusCode: 200, message: "A schedule for course with course code " + courseCode + " is created." });
        });
    }
});

Router.post("/enroll", async function (req, res, next) {
    const { error } = enrollmentSchema.validate(req.body);
    if (error) return next(error);

    const { studentId, courseCode, semesterAlias, groupId } = req.body;
    const courseQuery = await courseModel.findOneByCode({ code: courseCode });
    const semesterQuery = await semesterModel.findOneByAlias({ alias: semesterAlias });

    if (!courseQuery) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Course record with course code " + courseCode + " is invalid." });
    if (!semesterQuery) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Semester with alias " + semesterAlias + " is invalid." });

    const scheduleData = await scheduleModel.findOne({ courseCode, semesterAlias, groupId });
    const enrollmentQuery = await enrollmentModel.findOne({ courseCode, studentId, groupId, semesterAlias });
    const academicQuery = await academicModel.findByStudentInSemester({ studentId, semesterAlias });

    if (!academicQuery[0]) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "This class has not been registered in your academic plan." });
    if (!scheduleData) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "This schedule cannot be found." });
    if (scheduleData.memberNum >= scheduleData.limit) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "This class has been fulled with students." });
    if (!scheduleData.allowedEnroll) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "You do not have permission to enroll this class." });
    if (enrollmentQuery) return jsonResponse({ req, res }).failed({ statusCode: 200, message: "You have been enrolled this class before." });

    const enrollmentList = await enrollmentModel.findBySemester({ studentId, semesterAlias });

    res.json({ enrollmentList });

    // enrollmentModel.createOne({ studentId, courseCode, semesterAlias, groupId }, async (error, result) => {
    //     if (error) return next(error);
    //     await scheduleModel.updateMemberNumber({ courseCode, semesterAlias, groupId }, { memberNum: scheduleData.memberNum + 1 });
    //     return jsonResponse({ req, res }).success({ statusCode: 200, message: "You have been enrolled to this class." });
    // });
});

export default Router;
