import Joi from "joi";

const scheduleSchema = Joi.object({
    courseCode: Joi.number().required(),
    semesterAlias: Joi.string().required(),
    groupId: Joi.number().required(),
    limit: Joi.number().required(),
    periods: Joi.array().required(),
    weeks: Joi.array().required(),
    day: Joi.string().required().valid("Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
});

const scheduleEnrollment = Joi.object({
    studentId: Joi.string().required(),
    courseCode: Joi.number().required(),
    semesterAlias: Joi.string().required(),
    groupId: Joi.number().required(),
});

module.exports = { scheduleSchema, scheduleEnrollment };
