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
            registrationAllowed: { type: Boolean, default: true },
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
    async createOne({ courseCode = null, semesterAlias = null, classId = null, groupId = null, limit = null, periods = [], weeks = [], day = null }, callback) {
        if (!courseCode) return callback(throwError({ name: "MissedContent", message: "Course code must be provided.", status: 200 }), null);
        if (!semesterAlias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
        if (!classId) return callback(throwError({ name: "MissedContent", message: "Class ID must be provided.", status: 200 }), null);
        if (!groupId) return callback(throwError({ name: "MissedContent", message: "Group ID must be provided.", status: 200 }), null);
        if (!limit) return callback(throwError({ name: "MissedContent", message: "Limit must be provided.", status: 200 }), null);
        if (periods.length <= 0) return callback(throwError({ name: "MissedContent", message: "Length of periods must have at least 1.", status: 200 }), null);
        if (weeks.length <= 0) return callback(throwError({ name: "MissedContent", message: "Length of weeks must have at least 1.", status: 200 }), null);
        if (!day) return callback(throwError({ name: "MissedContent", message: "Day is must be provided.", status: 200 }), null);
        const newSchedule = await this.model.create({ courseCode, semesterAlias, classId, groupId, limit, periods, weeks, day });
        return callback(null, newSchedule);
    }
    async findOne({ courseCode, semesterAlias, classId, groupId }) {
        return await this.model.findOne({ courseCode, semesterAlias, classId, groupId });
    }
    enroll({ studentId, courseCode, semesterAlias, classId, groupId }, callback) {
        const _this = this;
        this.model.findOne({ courseCode, semesterAlias, classId, groupId }, function (error, result) {
            if (error) return callback(throwError({ error }), null);
            const { studentMember } = result;
            _this.model.updateOne({ courseCode, semesterAlias, classId, groupId }, { studentMember: studentMember.push(studentId) });
            return callback(null, result);
        });
    }
}

module.exports = new Schedule(model);
