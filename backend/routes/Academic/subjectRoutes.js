const express = require("express");
const { protect, restrictTo } = require("../../controllers/staff/adminController");
const {
  getAllSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} = require("../../controllers/Academic/subjectsController");

const validationFunction = require('../../middleware/validationFunction');
const { subjectValidationSchema, subjectUpdateSchema } = require('../../validation/academics/subjectValidation');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.route("/")
  .post(validationFunction(subjectValidationSchema), createSubject)
  .get(getAllSubjects);

router.route("/:id")
  .get(getSubject)
  .patch(validationFunction(subjectUpdateSchema), updateSubject)
  .delete(deleteSubject);

module.exports = router;
