const Joi = require('joi');

const subjectValidationSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      'any.required': 'Subject name is required',
    }),

  description: Joi.string()
    .required()
    .messages({
      'any.required': 'Subject description is required',
    }),

  academicTerm: Joi.string()
    .required()
    .messages({
      'any.required': 'Academic term is required',
    }),

}).options({ stripUnknown: true });

const subjectUpdateSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .messages({
      'string.min': 'Name must be at least {#limit} characters long',
      'string.max': 'Name cannot exceed {#limit} characters',
    }),

  description: Joi.string(),

  academicTerm: Joi.string(),

}).options({ stripUnknown: true });

module.exports = { subjectValidationSchema, subjectUpdateSchema };
