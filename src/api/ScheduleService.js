import express from "express";
import jsonResponse from "@/utils/json";
import scheduleModel from "@/models/schedule";
import courseModel from "@/models/course";
import semesterModel from "@/models/semester";
import academicModel from "@/models/academic";
import enrollmentModel from "@/models/enrollment";
import scheduleSchema from "@/schema/schedule";
import enrollmentSchema from "@/schema/enrollment";
import axios from "axios";

const Router = express.Router();

/* * * GET * * */
// Router.get("/", function (req, res, next) {
//     return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Course code has been removed." });
// });

Router.post("/all", async function (req, res, next) {
    const { semesterAlias } = req.body;
    if (!semesterAlias)
        return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Semester alias must be provided." });
    const scheduleData = await scheduleModel.findBySemester({ semesterAlias });
    return jsonResponse({ req, res }).success({
        statusCode: 200,
        message: "List schedule records in semester " + semesterAlias + ".",
        data: { total: scheduleData.length, list: scheduleData },
    });
});

/* * * POST * * */
Router.post("/new", async function (req, res, next) {
    const { error } = scheduleSchema.validate(req.body);
    if (error) return next(error);

    const { courseCode, semesterAlias, groupId, limit, periods, weeks, day } = req.body;
    const courseQuery = await courseModel.findOneByCode({ code: courseCode });
    const semesterQuery = await semesterModel.findOneByAlias({ alias: semesterAlias });

    if (!courseQuery)
        return jsonResponse({ req, res }).failed({
            statusCode: 200,
            message: "Course record with course code " + courseCode + " is invalid.",
        });
    if (!semesterQuery)
        return jsonResponse({ req, res }).failed({
            statusCode: 200,
            message: "Semester with alias " + semesterAlias + " is invalid.",
        });

    const classId = `${courseCode}-${semesterAlias}`;
    const courseData = await scheduleModel.findOne({ courseCode, semesterAlias, classId, groupId });

    if (courseData) {
        return jsonResponse({ req, res }).failed({
            statusCode: 200,
            message: "This schedule for course with course code " + courseCode + " is duplicated.",
        });
    } else {
        scheduleModel.createOne({ courseCode, semesterAlias, groupId, limit, periods, weeks, day }, (error, result) => {
            if (error) return next(error);
            return jsonResponse({ req, res }).success({
                status: true,
                statusCode: 200,
                message: "A schedule for course with course code " + courseCode + " is created.",
            });
        });
    }
});

Router.post("/enroll", async function (req, res, next) {
    const { error } = enrollmentSchema.validate(req.body);
    if (error) return next(error);

    const { studentId, courseCode, semesterAlias, groupId } = req.body;
    const academicQuery = await academicModel.findByStudentInSemesterHasCourseCode({
        studentId,
        semesterAlias,
        courseCode,
    });

    courseModel.findOneByCode({ code: courseCode }, async (err, course) => {
        // console.log(course.id);
        if (err) return next(err);
        const scheduleDataAll = await scheduleModel.findAll();
        const scheduleData = await scheduleModel.findOne({ courseCode, semesterAlias, groupId });
        const enrollmentQuery = await enrollmentModel.findOne({ courseCode, studentId, groupId, semesterAlias });
        const enrollmentList = await enrollmentModel.findBySemester({ studentId, semesterAlias });

        if (!academicQuery[0])
            return jsonResponse({ req, res }).failed({
                statusCode: 200,
                message: "This class has not been registered in your academic plan.",
            });
        if (!scheduleData)
            return jsonResponse({ req, res }).failed({ statusCode: 200, message: "This schedule cannot be found." });
        if (scheduleData.memberNum >= scheduleData.limit)
            return jsonResponse({ req, res }).failed({
                statusCode: 200,
                message: "This class has been fulled with students.",
            });
        if (!scheduleData.allowedEnroll)
            return jsonResponse({ req, res }).failed({
                statusCode: 200,
                message: "You do not have permission to enroll this class.",
            });
        if (enrollmentQuery)
            return jsonResponse({ req, res }).failed({
                statusCode: 200,
                message: "You have been enrolled this class before.",
            });

        const studentEnrollmentList = enrollmentList.map((item) => {
            const schedule = scheduleDataAll.find((schedule) => schedule.semesterAlias == item.semesterAlias);
            return {
                courseCode: item.courseCode,
                classId: schedule.classId,
                semesterAlias: item.semesterAlias,
                groupId: item.groupId,
                schedule: {
                    day: schedule.day,
                    periods: schedule.periods,
                    weeks: schedule.weeks,
                    memberNum: schedule.memberNum,
                },
            };
        });

        const duplicatedSchedule = studentEnrollmentList.find(
            (item) =>
                item.semesterAlias == scheduleData.semesterAlias &&
                item.schedule.day == scheduleData.day &&
                JSON.stringify(scheduleData.periods) == JSON.stringify(item.schedule.periods) &&
                JSON.stringify(scheduleData.weeks) == JSON.stringify(item.schedule.weeks)
        );

        if (duplicatedSchedule)
            return jsonResponse({ req, res }).failed({
                statusCode: 200,
                message: "You have a duplicated course in this day.",
                data: duplicatedSchedule,
            });

        enrollmentModel.createOne({ studentId, courseCode, semesterAlias, groupId }, async (error, result) => {
            if (error) return next(error);
            const allPoints = await axios.post(`${process.env.ClIENT_SERVICE}/api/user-service/v1/score/new`, {
                id_student: studentId,
                id_course: course._id,
                semester: semesterAlias,
            });
            if (allPoints.data.status) {
                await scheduleModel.updateMemberNumber(
                    { courseCode, semesterAlias, groupId },
                    { memberNum: scheduleData.memberNum + 1 }
                );
                return jsonResponse({ req, res }).success({
                    status: true,
                    statusCode: 200,
                    message: "You have been enrolled to this class successfully.",
                });
            } else {
                return next(new Error(allPoints.data.message));
            }
        });
    });
});

Router.delete("/delete-enroll", async function (req, res, next) {
    const { error } = enrollmentSchema.validate(req.body);
    if (error) return next(error);

    const { studentId, courseCode, semesterAlias, groupId } = req.body;
    const scheduleData = await scheduleModel.findOne({ courseCode, semesterAlias, groupId });
    const enrollmentQuery = await enrollmentModel.findOne({ courseCode, studentId, groupId, semesterAlias });
    if (!scheduleData)
        return jsonResponse({ req, res }).failed({ statusCode: 200, message: "This schedule cannot be found." });

    if (!enrollmentQuery)
        return jsonResponse({ req, res }).failed({ statusCode: 200, message: "You are not enroll this class before." });
    courseModel.findOneByCode({ code: courseCode }, async (err, course) => {
        if (err) return next(err);
        const allPoints = await axios.delete(`${process.env.ClIENT_SERVICE}/api/user-service/v1/score/delete`, {
            data: { id_student: studentId, id_course: course._id, semester: semesterAlias },
        });
        if (allPoints.data.status) {
            enrollmentModel.deleteOne({ studentId, courseCode, semesterAlias, groupId }, async (error, result) => {
                if (error) return next(error);

                await scheduleModel.updateMemberNumber(
                    { courseCode, semesterAlias, groupId },
                    { memberNum: scheduleData.memberNum - 1 }
                );
                return jsonResponse({ req, res }).success({
                    statusCode: 200,
                    message: "Your enrollment to this class has been remove successfully.",
                });
            });
        } else {
            return jsonResponse({ req, res }).success({
                statusCode: 200,
                message: allPoints.data.message,
            });
        }
    });
});

Router.post("/enrollment/all", async (req, res, next) => {
    const { studentId } = req.body;
    if (!studentId)
        return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Student ID must be provided." });
    const enrollmentList = await enrollmentModel.findAllByStudentId({ studentId });
    const scheduleData = await scheduleModel.findAll();
    const list = enrollmentList.map((item) => {
        const schedule = scheduleData.find((schedule) => schedule.semesterAlias == item.semesterAlias);
        return {
            courseCode: item.courseCode,
            classId: schedule.classId,
            semesterAlias: item.semesterAlias,
            groupId: item.groupId,
            schedule: {
                day: schedule.day,
                periods: schedule.periods,
                weeks: schedule.weeks,
                memberNum: schedule.memberNum,
                createdAt: item.createdAt,
            },
        };
    });
    return jsonResponse({ req, res }).success({
        statusCode: 200,
        message: "List of all course enrollment records retrieved successfully.",
        data: { studentId, total: enrollmentList.length, list },
    });
});
Router.post("/enrollment/semester", async (req, res, next) => {
    const { studentId, semesterAlias } = req.body;
    if (!studentId)
        return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Student ID must be provided." });
    if (!semesterAlias)
        return jsonResponse({ req, res }).failed({ statusCode: 200, message: "Semester alias must be provided." });

    const scheduleData = await scheduleModel.findAll();
    const enrollmentList = await enrollmentModel.findBySemester({ studentId, semesterAlias });

    const studentEnrollmentList = enrollmentList.map((item) => {
        const schedule = scheduleData.find((schedule) => schedule.semesterAlias == item.semesterAlias);
        return {
            courseCode: item.courseCode,
            classId: schedule.classId,
            semesterAlias: item.semesterAlias,
            groupId: item.groupId,
            schedule: {
                day: schedule.day,
                periods: schedule.periods,
                weeks: schedule.weeks,
                memberNum: schedule.memberNum,
            },
        };
    });

    return jsonResponse({ req, res }).success({
        statusCode: 200,
        message: "List course enrollment records in semester " + semesterAlias + ".",
        data: { total: studentEnrollmentList.length, list: studentEnrollmentList },
    });
});
export default Router;
