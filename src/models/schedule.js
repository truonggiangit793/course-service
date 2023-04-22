import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import { throwError } from "@/utils/helper";

const model = mongoose.model(
    "Schedule",
    new mongoose.Schema(
        {
            courseCode: { type: Number, require: true },
            semesterAlias: { type: String, required: true },
            classId: { type: String, required: true },
            groupId: { type: Number, required: true },
            limit: { type: Number, required: true },
            studentMember: { type: Array, default: [] },
            periods: { type: Array, required: true },
            weeks: { type: Array, required: true },
            registrationAllowed: { type: Boolean, default: false },
            day: {
                type: String,
                required: true,
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"],
            },
        },
        { timestamps: true }
    ).plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" })
);

class Schedule {
    constructor(model) {
        this.model = model;
    }
    async createOne(
        {
            courseCode = null,
            semesterAlias = null,
            classId = null,
            groupId = null,
            limit = null,
            studentMember = [],
            periods = [],
            weeks = [],
            day = [],
        },
        callback
    ) {
        if (!courseCode)
            return callback(
                throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }),
                null
            );

        if (!semesterAlias)
            return callback(
                throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }),
                null
            );

        if (!classId)
            return callback(
                throwError({ name: "MissedContent", message: "Class ID must be provided.", status: 200 }),
                null
            );

        if (!groupId)
            return callback(
                throwError({ name: "MissedContent", message: "Group ID must be provided.", status: 200 }),
                null
            );

        if (limit)
            return callback(
                throwError({ name: "MissedContent", message: "Limit must be provided.", status: 200 }),
                null
            );

        if (studentMember.length <= 0)
            return callback(
                throwError({
                    name: "MissedContent",
                    message: "Length of student member must have at least 1.",
                    status: 200,
                }),
                null
            );

        if (periods.length <= 0)
            return callback(
                throwError({ name: "MissedContent", message: "Length of periods must have at least 1.", status: 200 }),
                null
            );

        if (weeks.length <= 0)
            return callback(
                throwError({ name: "MissedContent", message: "Length of weeks must have at least 1.", status: 200 }),
                null
            );

        if (day.length <= 0)
            return callback(
                throwError({ name: "MissedContent", message: "Length of day must have at least 1.", status: 200 }),
                null
            );

        const newSchedule = await this.model.create({
            courseCode,
            semesterAlias,
            classId,
            groupId,
            limit,
            studentMember,
            periods,
            weeks,
            day,
        });

        return callback(null, newSchedule);
    }
    async findOne({ courseCode, semesterAlias, classId, groupId }) {
        return await this.model.findOne({ courseCode, semesterAlias, classId, groupId });
    }
    // findOneByCode({ code = null }, callback) {
    //     if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
    //     this.model.findOne({ code }, (error, course) => {
    //         if (error) return callback(throwError({ error }), null);
    //         if (course) return callback(null, course);
    //         return callback(
    //             throwError({
    //                 name: "NotFound",
    //                 message: "Course code " + code + " cannot be found or has been removed.",
    //                 status: 404,
    //             }),
    //             null
    //         );
    //     });
    // }
    // findAll(callback) {
    //     this.model.find({}, function (error, course) {
    //         if (course) return callback(null, course);
    //         return callback(throwError({ error }), null);
    //     });
    // }
    // findAllDeleted(callback) {
    //     this.model.findDeleted({}, function (error, course) {
    //         if (course) return callback(null, course);
    //         return callback(throwError({ error }), null);
    //     });
    // }
    // deleteOneByCode({ code = null }, callback) {
    //     if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
    //     this.model.findOne({ code }, (error, course) => {
    //         if (error) return callback(throwError({ error }), null);
    //         if (!course)
    //             return callback(
    //                 throwError({
    //                     name: "NotFound",
    //                     message: "Course record with course code " + code + " cannot be found.",
    //                     status: 404,
    //                 }),
    //                 null
    //             );
    //         return this.model.delete({ code }, (error, removed) => {
    //             if (error) return callback(throwError({ error }), null);
    //             return callback(null, course);
    //         });
    //     });
    // }
    // forceDeleteOneByCode({ code = null }, callback) {
    //     if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
    //     this.model.findDeleted({ code }, (error, course) => {
    //         if (error) return callback(throwError({ error }), null);
    //         if (course.length === 0)
    //             return callback(
    //                 throwError({
    //                     name: "NotFound",
    //                     message: "Course record with course code " + code + " cannot be found.",
    //                     status: 404,
    //                 }),
    //                 null
    //             );
    //         return this.model.remove({ code }, (error, removed) => {
    //             if (error) return callback(throwError({ error }), null);
    //             return callback(null, course[0]);
    //         });
    //     });
    // }
    // restoreOneByCode({ code = null }, callback) {
    //     if (!code) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
    //     this.model.findDeleted({ code }, (error, course) => {
    //         if (error) return callback(throwError({ error }), null);
    //         if (!course[0])
    //             return callback(
    //                 throwError({
    //                     name: "NotFound",
    //                     message: "Course record with course code " + code + " cannot be found.",
    //                     status: 404,
    //                 }),
    //                 null
    //             );
    //         return this.model.restore((error) => {
    //             if (error) return callback(throwError({ error }), null);
    //             return callback(null, course[0]);
    //         });
    //     });
    // }
}

module.exports = new Schedule(model);
