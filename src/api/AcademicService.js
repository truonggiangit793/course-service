import express from "express";
import jsonResponse from "@/utils/json";
import { academicSchema, academicListSchema } from "@/schema/academic";
import academicModel from "@/models/academic";
import semesterModel from "@/models/semester";
import courseModel from "@/models/course";
import axios from "axios";

const Router = express.Router();

/* * * GET * * */
Router.get("/get", (req, res, next) => {
    const { error } = academicListSchema.validate(req.query);
    if (error) return next(error);
    const { studentId, semesterAlias } = req.query;
    semesterModel.findOneByAlias({ alias: semesterAlias }, (err, semester) => {
        if (err) return next(err);
        academicModel.findByStudentInSemester({ studentId, semesterAlias }, (err, listAcademic) => {
            if (err) return next(err);
            return jsonResponse({ req, res }).success({
                statusCode: 200,
                message: "Academic details with student ID " + studentId + " in semester " + semesterAlias + ".",
                data: {
                    total: listAcademic.length,
                    list: listAcademic,
                },
            });
        });
    });
});
Router.get("/statistics/:alias", (req, res, next) => {
    const { alias } = req.params;
    courseModel.findAll((err, courseList) => {
        if (err) return next(err);
        semesterModel.findOneByAlias({ alias }, (err, semester) => {
            if (err) return next(err);
            academicModel.findBySemester({ alias }, (err, listAcademic) => {
                if (err) return next(err);
                let results = [];
                courseList.forEach((course) => {
                    let academicMatch = listAcademic.filter((academic) => academic.courseCode == course.code);
                    results.push({
                        courseCode: course.code,
                        name: course.name,
                        credit: course.credit,
                        description: course.description,
                        prerequisite: course.prerequisite,
                        semesterAlias: alias,
                        registrationCount: academicMatch.length,
                    });
                });
                return jsonResponse({ req, res }).success({
                    statusCode: 200,
                    message: "Get list academic statistics in semester " + alias + " successfully!",
                    data: results,
                });
            });
        });
    });
});

/* * * POST * * */
Router.post("/new", async (req, res, next) => {
    const { error } = academicSchema.validate(req.body);
    if (error) return next(error);
    const { studentId, courseCode, semesterAlias } = req.body;
    const registered = await academicModel.findByStudentInSemesterHasCourseCode({
        studentId,
        courseCode,
        semesterAlias,
    });
    if (registered[0])
        return jsonResponse({ req, res }).failed({
            statusCode: 200,
            message: "You have been registered this course in your academic plan!",
        });

    courseModel.findOneByCode({ code: courseCode }, async function (err, course) {
        if (err) return next(err);
        let isCorrect = null;
        const prerequisite = course.prerequisite;
        if (prerequisite.length > 0) {
            const allPoints = await axios.get(
                `${process.env.ClIENT_SERVICE}/api/user-service/v1/score/get/${studentId}`
            );
            if (allPoints.data.status) {
                prerequisite.forEach((element) => {
                    allPoints.data.data.forEach((item) => {
                        if (item?.gpa_course >= 5 && item.id_course == element.toString()) {
                            isCorrect = item;
                        }
                    });
                });
            } else {
                return next(new Error(allPoints.data.message));
            }
        } else {
            isCorrect = true;
        }
        if (!isCorrect) {
            return jsonResponse({ req, res }).failed({
                statusCode: 200,
                message: `Subject ${course.name} has an incomplete prerequisite subject. Please check and try again.`,
                data: isCorrect,
            });
        }
        academicModel.createOne({ studentId, courseCode, semesterAlias }, (err, academic) => {
            if (err) return next(err);
            return jsonResponse({ req, res }).success({
                statusCode: 200,
                message: "Successful study planning registration!",
                data: academic,
            });
        });
    });
});

Router.delete("/remove", async (req, res, next) => {
    const { error } = academicSchema.validate(req.body);
    if (error) return next(error);
    const { studentId, courseCode, semesterAlias } = req.body;
    const registered = await academicModel.findByStudentInSemesterHasCourseCode({
        studentId,
        courseCode,
        semesterAlias,
    });
    if (!registered[0])
        return jsonResponse({ req, res }).failed({
            statusCode: 200,
            message: "Cannot found this academic record",
        });

    academicModel.deleteOneByCode({ studentId, courseCode, semesterAlias }, async function (err, academic) {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({
            status: true,
            statusCode: 200,
            message: `Remove academic for course ${courseCode} successfully.`,
            data: academic,
        });
    });
});

export default Router;
