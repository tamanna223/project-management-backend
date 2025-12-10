const Task = require('../models/Task');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
    const { status, priority, search, project, dueBefore, dueAfter } = req.query;
    const query = { user: req.user.id };

    // Build the query
    if (status) {
        query.status = status;
    }
    if (priority) {
        query.priority = priority;
    }
    if (project) {
        query.project = project;
    }
    if (dueBefore || dueAfter) {
        query.dueDate = {};
        if (dueBefore) query.dueDate.$lte = new Date(dueBefore);
        if (dueAfter) query.dueDate.$gte = new Date(dueAfter);
    }
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Execute query
    const tasks = await Task.find(query)
        .populate('project', 'title')
        .populate('user', 'name email')
        .sort({ dueDate: 1, priority: -1 });
    
    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

// @desc    Get tasks by project
// @route   GET /api/v1/tasks/project/:projectId
// @access  Private
exports.getTasksByProject = asyncHandler(async (req, res, next) => {
    // Check if the project belongs to the user
    const project = await Project.findOne({ 
        _id: req.params.projectId, 
        user: req.user.id 
    });

    if (!project) {
        return next(
            new ErrorResponse(`No project found with id ${req.params.projectId}`, 404)
        );
    }

    const tasks = await Task.find({ 
        project: req.params.projectId,
        user: req.user.id
    })
    .populate('user', 'name email');

    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res, next) => {
    const task = await Task.findOne({ 
        _id: req.params.id,
        user: req.user.id
    })
    .populate('user', 'name email');

    if (!task) {
        return next(
            new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: task
    });
});

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res, next) => {
    // Check if the project exists and belongs to the user
    const project = await Project.findOne({ 
        _id: req.body.project,
        user: req.user.id
    });

    if (!project) {
        return next(
            new ErrorResponse(`No project found with id ${req.body.project}`, 404)
        );
    }

    // Add user to req.body
    req.body.user = req.user.id;

    const task = await Task.create(req.body);

    res.status(201).json({
        success: true,
        data: task
    });
});

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res, next) => {
    let task = await Task.findOne({ 
        _id: req.params.id,
        user: req.user.id
    });

    if (!task) {
        return next(
            new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
        );
    }

    // If project is being updated, verify it exists and belongs to the user
    if (req.body.project) {
        const project = await Project.findOne({ 
            _id: req.body.project,
            user: req.user.id
        });

        if (!project) {
            return next(
                new ErrorResponse(`No project found with id ${req.body.project}`, 404)
            );
        }
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: task
    });
});

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
    const task = await Task.findOne({ 
        _id: req.params.id,
        user: req.user.id
    });

    if (!task) {
        return next(
            new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
        );
    }

    await Task.deleteOne({ _id: task._id });

    res.status(200).json({
        success: true,
        data: {}
    });
});
