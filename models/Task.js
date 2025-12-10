const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter task title'],
        trim: true,
        maxLength: [200, 'Task title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter task description']
    },
    status: {
        type: String,
        enum: {
            values: ['todo', 'in-progress', 'completed'],
            message: 'Please select correct status for task'
        },
        default: 'todo'
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high'],
            message: 'Please select correct priority for task'
        },
        default: 'medium'
    },
    dueDate: {
        type: Date,
        required: [true, 'Please enter due date']
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
