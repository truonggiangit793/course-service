import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import { throwError } from "@/utils/helper";
import courseModel from "@/models/course";
import semesterModel from "@/models/semester";

const model = mongoose.model(
    "Academic",
    new mongoose.Schema(
        {
            studentId: { type: String, required: true },
            courseCode: { type: Number, require: true },
            semesterAlias: { type: String, required: true },
        },
        { timestamps: true }
    ).plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" })
);

class Academic {
    constructor(model) {
        this.model = model;
    }
    findByStudent({ studentId, semesterAlias }, callback) {
        if (!studentId) return callback(throwError({ name: "MissedContent", message: "Student ID must be provided.", status: 200 }), null);
        if (!semesterAlias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);

        this.model.findOne({ code }, (error, course) => {
            if (error) return callback(throwError({ error }), null);
            if (course) return callback(null, course);
            return callback(throwError({ name: "NotFound", message: "Course code " + code + " cannot be found or has been removed.", status: 404 }), null);
        });
    }
    findAll(callback) {
        this.model.find({}, function (error, course) {
            if (course) return callback(null, course);
            return callback(throwError({ error }), null);
        });
    }
    findAllDeleted(callback) {
        this.model.findDeleted({}, function (error, course) {
            if (course) return callback(null, course);
            return callback(throwError({ error }), null);
        });
    }
    deleteOneByCode({ code = null }, callback) {
        if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
        this.model.findOne({ code }, (error, course) => {
            if (error) return callback(throwError({ error }), null);
            if (!course) return callback(throwError({ name: "NotFound", message: "Course record with course code " + code + " cannot be found.", status: 404 }), null);
            return this.model.delete({ code }, (error, removed) => {
                if (error) return callback(throwError({ error }), null);
                return callback(null, course);
            });
        });
    }
    forceDeleteOneByCode({ code = null }, callback) {
        if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
        this.model.findDeleted({ code }, (error, course) => {
            if (error) return callback(throwError({ error }), null);
            if (course.length === 0) return callback(throwError({ name: "NotFound", message: "Course record with course code " + code + " cannot be found.", status: 404 }), null);
            return this.model.remove({ code }, (error, removed) => {
                if (error) return callback(throwError({ error }), null);
                return callback(null, course[0]);
            });
        });
    }
    restoreOneByCode({ code = null }, callback) {
        if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
        this.model.findDeleted({ code }, (error, course) => {
            if (error) return callback(throwError({ error }), null);
            if (!course[0]) return callback(throwError({ name: "NotFound", message: "Course record with course code " + code + " cannot be found.", status: 404 }), null);
            return this.model.restore((error) => {
                if (error) return callback(throwError({ error }), null);
                return callback(null, course[0]);
            });
        });
    }
    createOne({ studentId = null, courseCode = null, semesterAlias = null }, callback) {
        if (!studentId) return callback(throwError({ name: "MissedContent", message: "Student ID must be provided.", status: 200 }), null);
        if (!courseCode) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
        if (!semesterAlias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
        courseModel.findOneByCode({ code: parseInt(courseId) }, function (err, course) {
            if (err) return next(err);
            semesterModel.findOneByAlias({ alias }, (error, semester) => {
                if (err) return next(error);
                this.model.findOne({ studentId, courseCode, semesterAlias }, function (error, result) {
                    if (error) return callback(throwError({ error }), null);
                    if (result)
                        return callback(
                            throwError({
                                name: "MissedContent",
                                message: "You have been registered for this course with course code " + courseCode + " in semester with alias " + semesterAlias + ".",
                                status: 200,
                            }),
                            null
                        );
                });
            });
        });
    }
}

module.exports = new Academic(model);
