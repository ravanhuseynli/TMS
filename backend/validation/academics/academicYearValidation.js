const Joi = require('joi');

const academicYearValidationSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      'any.required': 'Academic year name is required',
    }),

  fromYear: Joi.number()
    .integer()
    .min(1900)
    .max(2100)
    .required()
    .messages({
      'any.required': 'Start year is required',
      'number.base': 'Start year must be a number',
      'number.integer': 'Start year must be an integer',
      'number.min': 'Start year cannot be before 1900',
      'number.max': 'Start year cannot be after 2100',
    }),

  toYear: Joi.number()
    .integer()
    .min(1900)
    .max(2100)
    .required()
    .greater(Joi.ref('fromYear'))
    .messages({
      'any.required': 'End year is required',
      'number.base': 'End year must be a number',
      'number.integer': 'End year must be an integer',
      'number.min': 'End year cannot be before 1900',
      'number.max': 'End year cannot be after 2100',
      'number.greater': 'End year must be greater than start year',
    }),

}).options({ stripUnknown: true });

// Update validation schema
const updateAcademicYearValidationSchema = Joi.object({
  name: Joi.string()
    .optional()
    .messages({
      'string.base': 'Academic year name must be a string',
    }),

  fromYear: Joi.number()
    .integer()
    .min(1900)
    .max(2100)
    .optional()
    .messages({
      'number.base': 'Start year must be a number',
      'number.integer': 'Start year must be an integer',
      'number.min': 'Start year cannot be before 1900',
      'number.max': 'Start year cannot be after 2100',
    }),

  toYear: Joi.number()
    .integer()
    .min(1900)
    .max(2100)
    .optional()
    .messages({
      'number.base': 'End year must be a number',
      'number.integer': 'End year must be an integer',
      'number.min': 'End year cannot be before 1900',
      'number.max': 'End year cannot be after 2100',
    }),

}).options({ stripUnknown: true });

module.exports = {
  academicYearValidationSchema,
  updateAcademicYearValidationSchema,
};
