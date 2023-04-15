import express from "express";
import jsonResponse from "@/utils/json";
import courseModel from "@/models/course";
import courseSchema from "@/schema/course";

const Router = express.Router();

/* * * POST * * */
Router.post("/new", function (req, res, next) {
    const { error } = courseSchema.validate(req.body);
    if (error) return next(error);
    const { code, name, credits, description, prerequisite } = req.body;
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
        return jsonResponse({ req, res }).success({
            statusCode: 200,
            message: "List of all course records retrieved successfully.",
            data: { total: courses.length, list: courses },
        });
    });
});
Router.get("/get-all-deleted", function (req, res, next) {
    courseModel.findAllDeleted((err, courses) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({
            statusCode: 200,
            message: "List of all deleted course records retrieved successfully.",
            data: { total: courses.length, list: courses },
        });
    });
});
Router.get("/get/:courseId", function (req, res, next) {
    const { courseId } = req.params;
    courseModel.findOneByCode({ code: parseInt(courseId) }, (err, course) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: "Detail of " + course.name + " course record with course code " + courseId + ".", data: course });
    });
});

/* * * DELETE * * */
Router.delete("/delete/:courseId", function (req, res, next) {
    const { courseId } = req.params;
    courseModel.deleteOneByCode({ code: parseInt(courseId) }, (err, course) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: course.name + " course with course code " + courseId + " has been removed." });
    });
});
Router.delete("/delete/:courseId/force", function (req, res, next) {
    const { courseId } = req.params;
    courseModel.forceDeleteOneByCode({ code: parseInt(courseId) }, (err, course) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: course.name + " course with course code " + courseId + " has been removed out of database." });
    });
});

/* * * PUT * * */
Router.put("/restore/:courseId", function (req, res, next) {
    const { courseId } = req.params;
    courseModel.restoreOneByCode({ code: parseInt(courseId) }, (err, course) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({ statusCode: 200, message: course.name + " course with course code " + courseId + " has been restored." });
    });
});

export default Router;
