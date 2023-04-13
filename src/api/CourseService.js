import express from "express";
import jsonResponse from "@/utils/json";
import courseModel from "@/models/course";

const Router = express.Router();

/* * * POST * * */
Router.post("/new", function (req, res, next) {
    const { error } = courseSchema.validate(req.body);
    if (error) return next(error);
    const code = req.body.code;
    const name = req.body.name;
    const credits = req.body.credits;
    const description = req.body.description;
    const prerequisite = req.body.prerequisite;
    const timeAllocation = { theory: req.body.theory, practice: req.body.practice, selfStudy: req.body.selfStudy };
    courseModel.createOne({ code, name, credits, description, prerequisite, timeAllocation }, (err, course) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: name + " has been created successfully!", data: course });
    });
});

/* * * GET * * */
Router.get("/get-all", function (req, res, next) {
    courseModel.findAll((err, courses) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: "Get list of all courses.", data: { total: courses.length, list: courses } });
    });
});
Router.get("/get-all-deleted", function (req, res, next) {
    courseModel.findAllDeleted((err, courses) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: "Get list of all deleted courses.", data: { total: courses.length, list: courses } });
    });
});
Router.get("/get/:courseId", function (req, res, next) {
    const { courseId } = req.params;
    courseModel.restoreOne({ code: parseInt(courseId) }, (err, success) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: "Course code " + courseId + " has been restored." });
    });
});

/* * * DELETE * * */
Router.delete("/delete/:courseId", function (req, res, next) {
    const { courseId } = req.params;
    courseModel.deleteOneByCode({ code: parseInt(courseId) }, (err, removed) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: "Course code " + courseId + " has been removed." });
    });
});

/* * * PUT * * */
Router.put("/restore/:courseId", function (req, res, next) {
    const { courseId } = req.params;
    courseModel.restoreOne({ code: parseInt(courseId) }, (err, success) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: "Course code " + courseId + " has been restored." });
    });
});

export default Router;
