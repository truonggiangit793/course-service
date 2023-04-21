import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import { throwError } from "@/utils/helper";

const model = mongoose.model(
    "Semester",
    new mongoose.Schema({ alias: { type: String, required: true, unique: true } }, { timestamps: true }).plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" })
);

class Semester {
    constructor(model) {
        this.model = model;
    }
    findOneByAlias({ alias = null }, callback) {
        if (!alias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
        this.model.findOne({ alias }, (error, semester) => {
            if (error) return callback(throwError({ error }), null);
            if (semester) return callback(null, semester);
            return callback(throwError({ name: "NotFound", message: "Semester with alias " + alias + " cannot be found or has been removed.", status: 404 }), null);
        });
    }
    findAll(callback) {
        this.model.find({}, function (error, semester) {
            if (semester) return callback(null, semester);
            return callback(throwError({ error }), null);
        });
    }
    findAllDeleted(callback) {
        this.model.findDeleted({}, function (error, semester) {
            if (semester) return callback(null, semester);
            return callback(throwError({ error }), null);
        });
    }
    deleteOneByAlias({ alias = null }, callback) {
        if (!alias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
        this.model.findOne({ alias }, (error, semester) => {
            if (error) return callback(throwError({ error }), null);
            if (!semester) return callback(throwError({ name: "NotFound", message: "Semester with alias " + alias + " cannot be found or has been removed.", status: 404 }), null);
            return this.model.delete({ alias }, (error, removed) => {
                if (error) return callback(throwError({ error }), null);
                return callback(null, semester);
            });
        });
    }
    forceDeleteOneByAlias({ alias = null }, callback) {
        if (!alias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
        this.model.findDeleted({ alias }, (error, semester) => {
            if (error) return callback(throwError({ error }), null);
            if (semester.length === 0)
                return callback(throwError({ name: "NotFound", message: "Semester with alias " + alias + " cannot be found or has been removed.", status: 404 }), null);
            return this.model.remove({ alias }, (error, removed) => {
                if (error) return callback(throwError({ error }), null);
                return callback(null, semester[0]);
            });
        });
    }
    restoreOneByAlias({ alias = null }, callback) {
        if (!alias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
        this.model.findDeleted({ alias }, (error, semester) => {
            if (error) return callback(throwError({ error }), null);
            if (!semester[0])
                return callback(throwError({ name: "NotFound", message: "Semester with alias " + alias + " cannot be found or has been removed.", status: 404 }), null);
            return this.model.restore((error) => {
                if (error) return callback(throwError({ error }), null);
                return callback(null, semester[0]);
            });
        });
    }
    createOne({ alias = null }, callback) {
        if (!alias) return callback(throwError({ name: "MissedContent", message: "Semester alias must be provided.", status: 200 }), null);
        this.findOneByAlias({ alias }, async (err, semester) => {
            if (semester) return callback(throwError({ name: "DatabaseError", message: `Semester with alias ${semester.alias} is already existed.`, status: 200 }), null);
            const newSemester = await this.model.create({ alias });
            return callback(null, newSemester);
        });
    }
}

module.exports = new Semester(model);