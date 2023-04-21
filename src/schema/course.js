import Joi from "joi";

export default Joi.object({
    code: Joi.number().required(),
    name: Joi.string().required(),
    credits: Joi.number().min(1).required(),
    description: Joi.string().required(),
    prerequisite: Joi.array(),
    departmentAllowed: Joi.string().required(),
    timeAllocation: Joi.object(),
});
