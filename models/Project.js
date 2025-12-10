const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter project title'],
        trim: true,
        maxLength: [100, 'Project title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter project description']
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

module.exports = mongoose.model('Project', projectSchema);
