import Joi from "joi";

export default Joi.object({
    courseCode: Joi.number().required(),
    semesterAlias: Joi.string().required(),
    groupId: Joi.number().required(),
    limit: Joi.number().required(),
    periods: Joi.array().required(),
    weeks: Joi.array().required(),
    day: Joi.string().required().valid("Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
});
