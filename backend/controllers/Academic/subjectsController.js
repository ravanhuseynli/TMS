const Admin = require("../../models/Staff/Admin");
const asyncHandler = require("../../utils/asyncHandler");
const Subject = require("../../models/Academic/Subject");
const AcademicTerm = require("../../models/Academic/AcademicTerm");
const AppError = require("../../utils/appErrors");

exports.createSubject = asyncHandler(async (req, res, next) => {
  const { name, description, academicTerm } = req.body;
  const createdBy = req.user.id;
  
  //check if subject exists
  const subjectFound = await Subject.findOne({ name });
  if (subjectFound) {
    return next(new AppError("Subject already exists", 400));
  }
  
  //check if academic term exists
  const academicTermFound = await AcademicTerm.findById(academicTerm);
  if (!academicTermFound) {
    return next(new AppError("Academic term not found", 400));
  }
  
  //create
  const subjectCreated = await Subject.create({
    name,
    description,
    academicTerm,
    createdBy
  });
  
  //push subject into admin
  const admin = await Admin.findById(createdBy);
  admin.subjects.push(subjectCreated._id);
  //save
  await admin.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    data: {
      subject: subjectCreated,
    },
  });
});

exports.getAllSubjects = asyncHandler(async (req, res, next) => {
  const subjects = await Subject.find().populate('academicTerm');
  res.status(200).json({
    status: "success",
    data: {
      subjects,
    },
  });
});

exports.getSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id).populate('academicTerm');

  if (!subject) {
    return next(new AppError('No subject with that id', 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      subject,
    },
  });
});

exports.updateSubject = asyncHandler(async (req, res, next) => {
  const { name, description, academicTerm } = req.body;
  
  //check if name exists (but exclude current subject)
  const subjectFound = await Subject.findOne({ 
    name, 
    _id: { $ne: req.params.id } 
  });
  if (subjectFound) {
    return next(new AppError("Subject already exists", 400));
  }
  
  //check if academic term exists (if academicTerm is being updated)
  if (academicTerm) {
    const academicTermFound = await AcademicTerm.findById(academicTerm);
    if (!academicTermFound) {
      return next(new AppError("Academic term not found", 400));
    }
  }
  
  const subject = await Subject.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      academicTerm,
      createdBy: req.user.id,
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('academicTerm');

  if (!subject) {
    return next(new AppError('No subject with that id', 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      subject,
    },
  });
});

exports.deleteSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);

  if (!subject) {
    return next(new AppError('No subject with that id', 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
