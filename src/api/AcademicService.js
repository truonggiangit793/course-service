import express from "express";
import jsonResponse from "@/utils/json";
import { academicSchema, academicListSchema } from "@/schema/academic";
import academicModel from "@/models/academic";
import semesterModel from "@/models/semester";

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
    academicModel.createOne({ studentId, courseCode, semesterAlias }, (err, academic) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({
            statusCode: 200,
            message: "Successful study planning registration!",
            data: academic,
        });
    });
});
/* * * DELETE * * */

/* * * PUT * * */

export default Router;
