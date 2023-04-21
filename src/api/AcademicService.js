import express from "express";
import jsonResponse from "@/utils/json";
import { academicSchema, academicListSchema } from "@/schema/academic";
import academicModel from "@/models/academic";
import semesterModel from "@/models/semester";
import courseModel from "@/models/course";
import axios from "axios";

const Router = express.Router();

/* * * GET * * */
Router.get("/get-list-academic", (req, res, next) => {
    const { error } = academicListSchema.validate(req.query);
    if (error) return next(error);
    const { studentId, semesterAlias } = req.query;
    semesterModel.findOneByAlias({ alias: semesterAlias }, (err, semester) => {
        if (err) return next(err);
        academicModel.findByStudentInSemester({ studentId, semesterAlias }, (err, listAcademic) => {
            if (err) return next(err);
            return jsonResponse({ req, res }).success({
                statusCode: 200,
                message:
                    "get List academic for student " + studentId + " in semester " + semesterAlias + "successfully!",
                data: listAcademic,
            });
        });
    });
});

/* * * POST * * */
Router.post("/new", (req, res, next) => {
    const { error } = academicSchema.validate(req.body);
    if (error) return next(error);
    const { studentId, courseCode, semesterAlias } = req.body;
    courseModel.findOneByCode({ code: courseCode }, async function (err, course) {
        if (err) return callback(err, null);
        let isCorrect = null;
        const prerequisite = course.prerequisite;
        if (prerequisite.length > 0) {
            const allPoints = await axios.get(`${process.env.ClIENT_SERVICE}/score/get/${studentId}`);
            console.info(allPoints);
            prerequisite.forEach((element) => {
                allPoints.data.data.forEach((item) => {
                    if (item?.gpa_course >= 5 && item.id_course == element.toString()) {
                        // console.log(item);
                        isCorrect = item;
                    }
                });
            });
        } else {
            isCorrect = true;
        }
        console.log(isCorrect);
        if (!isCorrect) {
            return jsonResponse({ req, res }).failed({
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
/* * * DELETE * * */

/* * * PUT * * */

/* * * GET : ADMIN * * */

Router.get("/get-academic-statistics/:alias", (req, res, next) => {
    const alias = req.params.alias || null;
    // academicModel.test((err, data) => {
    //     console.info(data);
    // });
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
                        course,
                        numberOfStudent: academicMatch.length,
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
export default Router;
