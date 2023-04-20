import Joi from "joi";

const academicSchema = Joi.object({
    studentId: Joi.string().required(),
    courseCode: Joi.number().required(),
    semesterAlias: Joi.string().required(),
});
const academicListSchema = Joi.object({
    studentId: Joi.string().required(),
    semesterAlias: Joi.string().required(),
    api_key: Joi.string(),
});
module.exports = { academicSchema, academicListSchema };
