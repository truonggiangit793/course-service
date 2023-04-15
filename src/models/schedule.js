import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import { throwError } from "@/utils/helper";

const model = mongoose.model(
    "Schedule",
    new mongoose.Schema(
        {
            code: { type: Number, require: true },
            classId: { type: Number, required: true },
            groupId: { type: Number, required: true },
            timeStart: { type: Number, required: true },
            timeEnd: { type: Number, required: true },
            limit: { type: Number, required: true },
        },
        { timestamps: true }
    ).plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" })
);

class Course {
    constructor(model) {
        this.model = model;
    }
    findOneByCode({ code = null }, callback) {
        if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
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
    createOne({ code = null, name = null, credits = null, description = null, prerequisite = [], timeAllocation = {} }, callback) {
        const invalidPrerequisite = prerequisite.filter((item) => !mongoose.Types.ObjectId.isValid(item));

        if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);

        if (!name) return callback(throwError({ name: "MissedContent", message: "Course name must be provided.", status: 200 }), null);

        if (!credits) return callback(throwError({ name: "MissedContent", message: "Course credits must be provided.", status: 200 }), null);

        if (!description) return callback(throwError({ name: "MissedContent", message: "Course description must be provided.", status: 200 }), null);

        if (invalidPrerequisite?.length > 0) return callback(throwError({ name: "InvalidObjectID", message: "Prerequisite has an invalid ObjectId.", status: 200 }), null);

        if (!timeAllocation.hasOwnProperty("theory") && !timeAllocation.hasOwnProperty("practice") && !timeAllocation.hasOwnProperty("selfStudy"))
            return callback(throwError({ name: "SyntaxError", message: "Properties of timeAllocation is invalid.", status: 200 }), null);

        this.findOneByCode({ code }, async (err, course) => {
            if (course) return callback(throwError({ name: "DatabaseError", message: `${course.name} course with course code ${code} is already existed.`, status: 200 }), null);
            const timeAllocation = { theory: timeAllocation?.theory || 1, practice: timeAllocation?.practice || 1, selfStudy: timeAllocation?.selfStudy || 1 };
            const newCourse = await this.model.create({ code, name, credits, description, prerequisite, timeAllocation });
            return callback(null, newCourse);
        });
    }
}

module.exports = new Course(model);
