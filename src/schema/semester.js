import Joi from "joi";

export default Joi.object({ alias: Joi.string().required() });
