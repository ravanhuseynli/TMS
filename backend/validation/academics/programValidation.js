const Joi = require('joi');

const programValidationSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      'any.required': 'Program name is required',
    }),

  description: Joi.string()
    .required()
    .messages({
      'any.required': 'Program description is required',
    }),

}).options({ stripUnknown: true });

const programUpdateSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .messages({
      'string.min': 'Name must be at least {#limit} characters long',
      'string.max': 'Name cannot exceed {#limit} characters',
    }),

  description: Joi.string(),

}).options({ stripUnknown: true });

module.exports = { programValidationSchema, programUpdateSchema };
