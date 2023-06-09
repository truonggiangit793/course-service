import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import { throwError } from "@/utils/helper";

const model = mongoose.model(
    "Enrollment",
    new mongoose.Schema(
        {
            studentId: { type: String, required: true },
            courseCode: { type: Number, require: true },
            semesterAlias: { type: String, required: true },
            classId: { type: String, required: true },
            groupId: { type: Number, required: true },
        },
        { timestamps: true }
    ).plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" })
);

class Enrollment {
    constructor(model) {
        this.model = model;
    }
    async createOne({ courseCode = null, semesterAlias = null, groupId = null, studentId = null }, callback) {
        const classId = `${courseCode}-${semesterAlias}`;
        if (!studentId)
            return callback(
                throwError({ name: "MissedContent", message: "Student ID must be provided.", status: 200 }),
                null
            );
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
        if (!groupId)
            return callback(
                throwError({ name: "MissedContent", message: "Group ID must be provided.", status: 200 }),
                null
            );
        const newEnrollment = await this.model.create({ studentId, courseCode, semesterAlias, classId, groupId });
        return callback(null, newEnrollment);
    }
    async deleteOne({ courseCode = null, semesterAlias = null, groupId = null, studentId = null }, callback) {
        if (!studentId)
            return callback(
                throwError({ name: "MissedContent", message: "Student ID must be provided.", status: 200 }),
                null
            );
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
        if (!groupId)
            return callback(
                throwError({ name: "MissedContent", message: "Group ID must be provided.", status: 200 }),
                null
            );
        const enroll = await this.model.deleteOne({ studentId, courseCode, semesterAlias, groupId });
        return callback(null, enroll);
    }
    async findOne({ courseCode, studentId, groupId, semesterAlias }) {
        const classId = `${courseCode}-${semesterAlias}`;
        return await this.model.findOne({ studentId, classId, groupId });
    }
    async findAllByStudentId({ studentId }) {
        return await this.model.find({ studentId });
    }
    async findBySemester({ studentId, semesterAlias }) {
        return await this.model.find({ studentId, semesterAlias });
    }
}

module.exports = new Enrollment(model);
