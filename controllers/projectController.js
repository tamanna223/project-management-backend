const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all projects
// @route   GET /api/v1/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res, next) => {
    const projects = await Project.find({ user: req.user.id });
    
    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
    });
});

// @desc    Get single project
// @route   GET /api/v1/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });

    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user owns the project
    if (project.user.toString() !== req.user.id) {
        return next(
            new ErrorResponse(`User not authorized to access this project`, 401)
        );
    }

    res.status(200).json({
        success: true,
        data: project
    });
});

// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private
exports.createProject = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    const project = await Project.create(req.body);

    res.status(201).json({
        success: true,
        data: project
    });
});

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res, next) => {
    let project = await Project.findById(req.params.id);

    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user owns the project
    if (project.user.toString() !== req.user.id) {
        return next(
            new ErrorResponse(`User not authorized to update this project`, 401)
        );
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: project
    });
});

// @desc    Delete project
// @route   DELETE /api/v1/projects/:id
// @access  Private
exports.deleteProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user owns the project
    if (project.user.toString() !== req.user.id) {
        return next(
            new ErrorResponse(`User not authorized to delete this project`, 401)
        );
    }

    await Project.deleteOne({ _id: project._id });

    res.status(200).json({
        success: true,
        data: {}
    });
});
