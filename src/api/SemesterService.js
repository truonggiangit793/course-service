import express from "express";
import jsonResponse from "@/utils/json";
import semesterModel from "@/models/semester";
import semesterSchema from "@/schema/semester";

const Router = express.Router();

/* * * POST * * */
Router.post("/new", function (req, res, next) {
    const { error } = semesterSchema.validate(req.body);
    if (error) return next(error);
    const { alias } = req.body;
    semesterModel.createOne({ alias }, (err, semester) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({
            statusCode: 200,
            message: "Semester with alias " + alias + " has been created successfully!",
            data: semester,
        });
    });
});

/* * * GET * * */
Router.get("/get-all", function (req, res, next) {
    semesterModel.findAll((err, semester) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({
            statusCode: 200,
            message: "List of all semester alias records retrieved successfully.",
            data: { total: semester.length, list: semester },
        });
    });
});
/* * * GET * * */
Router.get("/get-all-deleted", function (req, res, next) {
    semesterModel.findAllDeleted((err, semester) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({
            statusCode: 200,
            message: "List of all deleted semester alias records retrieved successfully.",
            data: { total: semester.length, list: semester },
        });
    });
});
/* * * GET * * */
Router.get("/get/:alias", function (req, res, next) {
    const { alias } = req.params;
    semesterModel.findOneByAlias({ alias }, (err, semester) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({
            statusCode: 200,
            message: "Get record of semester with alias " + alias + ".",
            data: semester,
        });
    });
});

/* * * PATCH * * */
Router.patch("/:alias", function (req, res, next) {
    const { alias } = req.params;
    semesterModel.findOneByAlias({ alias }, (err, semester) => {
        if (err) return next(err);
        semesterModel.updateStatusSemester({ alias }, (err, semester) => {
            if (err) return next(err);
            return jsonResponse({ req, res }).success({
                statusCode: 200,
                message: `Update status semester ${alias} successfully`,
                data: semester,
            });
        });
    });
});
/* * * DELETE * * */
Router.delete("/delete/:alias", function (req, res, next) {
    const { alias } = req.params;
    semesterModel.deleteOneByAlias({ alias }, (err, semester) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({
            statusCode: 200,
            message: "Semester with alias " + alias + " has been removed.",
        });
    });
});
Router.delete("/delete/:alias/force", function (req, res, next) {
    const { alias } = req.params;
    semesterModel.forceDeleteOneByAlias({ alias }, (err, semester) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({
            statusCode: 200,
            message: "Semester with alias " + alias + " has been removed out of database.",
        });
    });
});

/* * * PUT * * */
Router.put("/restore/:alias", function (req, res, next) {
    const { alias } = req.params;
    semesterModel.restoreOneByAlias({ alias }, (err, course) => {
        if (err) return next(err);
        return jsonResponse({ req, res }).success({
            statusCode: 200,
            message: "Semester with alias " + alias + " has been restored.",
        });
    });
});

export default Router;
