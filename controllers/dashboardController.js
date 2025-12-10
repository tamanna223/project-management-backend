const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');

exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const stats = await Task.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] 
          } 
        },
        inProgress: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] 
          } 
        },
        todo: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] 
          } 
        },
        highPriority: {
          $sum: {
            $cond: [{ $eq: ['$priority', 'high'] }, 1, 0]
          }
        },
        dueThisWeek: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $gte: ['$dueDate', new Date()] },
                  { $lte: ['$dueDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] }
                ] 
              },
              1, 
              0
            ]
          }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || { 
      total: 0, 
      completed: 0, 
      inProgress: 0, 
      todo: 0,
      highPriority: 0,
      dueThisWeek: 0
    }
  });
});

exports.getProjectStats = asyncHandler(async (req, res, next) => {
  const stats = await Task.aggregate([
    { 
      $match: { 
        user: new mongoose.Types.ObjectId(req.user.id),
        project: new mongoose.Types.ObjectId(req.params.projectId)
      } 
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});
