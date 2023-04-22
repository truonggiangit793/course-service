import Joi from "joi";

export default Joi.object({
    studentId: Joi.string().required(),
    courseCode: Joi.number().required(),
    semesterAlias: Joi.string().required(),
    groupId: Joi.number().required(),
});
