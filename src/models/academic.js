import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import semesterModel from "@/models/semester";
import { throwError } from "@/utils/helper";

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
    async findByStudentInSemester({ studentId, semesterAlias }, callback = null) {
        if (!callback) return await this.model.find({ studentId, semesterAlias });
        if (!studentId) return callback(throwError({ name: "MissedContent", message: "Student ID must be provided.", status: 200 }), null);
        if (!semesterAlias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
        this.model.find({ studentId, semesterAlias }, (error, academic) => {
            if (error) return callback(throwError({ error }), null);
            if (academic[0]) return callback(null, academic);
            return callback(
                throwError({
                    name: "NotFound",
                    message: "Academic for student " + studentId + " cannot be found or has been removed.",
                    status: 404,
                }),
                null
            );
        });
    }
    async findByStudentInSemesterHasCourseCode({ studentId, semesterAlias, courseCode }, callback = null) {
        if (!callback) return await this.model.find({ studentId, semesterAlias, courseCode });
        if (!studentId) return callback(throwError({ name: "MissedContent", message: "Student ID must be provided.", status: 200 }), null);
        if (!semesterAlias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
        if (!courseCode) return callback(throwError({ name: "MissedContent", message: "courseCode alias must be provided.", status: 200 }), null);
        this.model.find({ studentId, semesterAlias, courseCode }, (error, academic) => {
            if (error) return callback(throwError({ error }), null);
            if (academic[0]) return callback(null, academic);
            return callback(
                throwError({
                    name: "NotFound",
                    message: "Academic for student " + studentId + " cannot be found or has been removed.",
                    status: 404,
                }),
                null
            );
        });
    }
    async findBySemester({ alias }, callback = null) {
        if (!callback) return await this.model.find({ alias });
        if (!alias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
        this.model.find({ alias }, function (error, academicList) {
            if (academicList) return callback(null, academicList);
            return callback(throwError({ error }), null);
        });
    }
    async findByCodeCourse({ codeCourse }, callback = null) {
        if (!callback) return await this.model.find({ codeCourse });
        if (!codeCourse) return callback(throwError({ name: "MissedContent", message: "codeCourse must be provided.", status: 200 }), null);
        this.model.find({ codeCourse }, function (error, academicList) {
            if (academicList) return callback(null, academicList);
            return callback(throwError({ error }), null);
        });
    }
    async findAll(callback = null) {
        if (!callback) return await this.model.find({});
        this.model.find({}, function (error, course) {
            if (course) return callback(null, course);
            return callback(throwError({ error }), null);
        });
    }
    async findAllDeleted(callback = null) {
        if (!callback) return await this.model.findDeleted({});
        this.model.findDeleted({}, function (error, course) {
            if (course) return callback(null, course);
            return callback(throwError({ error }), null);
        });
    }
    deleteOneByCode({ code = null }, callback) {
        if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
        this.model.findOne({ code }, (error, course) => {
            if (error) return callback(throwError({ error }), null);
            if (!course)
                return callback(
                    throwError({
                        name: "NotFound",
                        message: "Course record with course code " + code + " cannot be found.",
                        status: 404,
                    }),
                    null
                );
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
            if (course.length === 0)
                return callback(
                    throwError({
                        name: "NotFound",
                        message: "Course record with course code " + code + " cannot be found.",
                        status: 404,
                    }),
                    null
                );
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
            if (!course[0])
                return callback(
                    throwError({
                        name: "NotFound",
                        message: "Course record with course code " + code + " cannot be found.",
                        status: 404,
                    }),
                    null
                );
            return this.model.restore((error) => {
                if (error) return callback(throwError({ error }), null);
                return callback(null, course[0]);
            });
        });
    }
    async createOne({ studentId = null, courseCode = null, semesterAlias = null }, callback) {
        try {
            if (!studentId) return callback(throwError({ name: "MissedContent", message: "Student ID must be provided.", status: 200 }), null);
            if (!courseCode) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
            if (!semesterAlias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
            const _this = this;
            semesterModel.findOneByAlias({ alias: semesterAlias }, async function (error, semester) {
                if (error) return callback(error, null);
                const isExits = _this.model.find({ studentId, courseCode, semesterAlias });
                if (isExits.length > 0) {
                    return callback(
                        throwError({
                            name: "MissedContent",
                            message: "You have been registered for this course with course code " + courseCode + " in semester with alias " + semesterAlias + ".",
                            status: 200,
                        }),
                        null
                    );
                } else {
                    const academicQuery = new _this.model({ studentId, courseCode, semesterAlias });
                    await academicQuery.save();
                    return callback(null, academicQuery);
                }
            });
        } catch (err) {
            callback(err, null);
        }
    }
}

module.exports = new Academic(model);
