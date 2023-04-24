import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import { throwError } from "@/utils/helper";

const model = mongoose.model(
    "Course",
    new mongoose.Schema(
        {
            code: { type: Number, require: true, unique: true },
            name: { type: String, required: true },
            credits: { type: Number, min: 1, required: true },
            description: { type: String, required: true },
            prerequisite: { type: [mongoose.Types.ObjectId], default: [] },
            departmentAllowed: { type: String, required: true },
            timeAllocation: {
                theory: { type: Number, min: 1, max: 400, default: 0 },
                practice: { type: Number, min: 1, max: 400, default: 0 },
                selfStudy: { type: Number, min: 1, max: 400, default: 0 },
            },
        },
        { timestamps: true }
    ).plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" })
);

class Course {
    constructor(model) {
        this.model = model;
    }
    async findOneByCode({ code = null }, callback = null) {
        if (!callback) return await this.model.findOne({ code });
        if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
        this.model.findOne({ code }, (error, course) => {
            if (error) return callback(throwError({ error }), null);
            if (course) return callback(null, course);
            return callback(
                throwError({
                    name: "NotFound",
                    message: "Course code " + code + " cannot be found or has been removed.",
                    status: 404,
                }),
                null
            );
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
    deleteOneByCode({ code = null }, callback = null) {
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
    createOne({ code = null, name = null, credits = null, description = null, prerequisite = [], departmentAllowed = null, timeAllocation = {} }, callback) {
        const invalidPrerequisite = prerequisite.filter((item) => !mongoose.Types.ObjectId.isValid(item));

        this.model.find({}, (error, result) => {
            if (error) return callback(throwError({ error }), null);

            const validPrerequisite = prerequisite.every((item) => result.find((i) => i._id == item)?._id == item);

            if (!validPrerequisite)
                return callback(
                    throwError({
                        name: "InvalidObjectID",
                        message: "Have an invalid prerequisite course, please try again.",
                        status: 200,
                    }),
                    null
                );

            if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);

            if (!name) return callback(throwError({ name: "MissedContent", message: "Course name must be provided.", status: 200 }), null);

            if (!credits) return callback(throwError({ name: "MissedContent", message: "Course credits must be provided.", status: 200 }), null);

            if (!description) return callback(throwError({ name: "MissedContent", message: "Course description must be provided.", status: 200 }), null);

            if (!departmentAllowed)
                return callback(
                    throwError({
                        name: "MissedContent",
                        message: "Course departmentAllowed must be provided.",
                        status: 200,
                    }),
                    null
                );

            if (invalidPrerequisite?.length > 0)
                return callback(
                    throwError({
                        name: "InvalidObjectID",
                        message: "Prerequisite has an invalid ObjectId.",
                        status: 200,
                    }),
                    null
                );

            if (!timeAllocation.hasOwnProperty("theory") && !timeAllocation.hasOwnProperty("practice") && !timeAllocation.hasOwnProperty("selfStudy"))
                return callback(
                    throwError({
                        name: "SyntaxError",
                        message: "Properties of timeAllocation is invalid.",
                        status: 200,
                    }),
                    null
                );

            this.findOneByCode({ code }, async (err, course) => {
                if (course)
                    return callback(
                        throwError({
                            name: "DatabaseError",
                            message: `${course.name} course with course code ${code} is already existed.`,
                            status: 200,
                        }),
                        null
                    );
                const timeAllocation = {
                    theory: timeAllocation?.theory || 1,
                    practice: timeAllocation?.practice || 1,
                    selfStudy: timeAllocation?.selfStudy || 1,
                };
                const newCourse = await this.model.create({
                    code,
                    name,
                    credits,
                    description,
                    prerequisite,
                    departmentAllowed,
                    timeAllocation,
                });
                return callback(null, newCourse);
            });
        });
    }
}

module.exports = new Course(model);
