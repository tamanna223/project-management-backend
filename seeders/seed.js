const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  }
];

// Sample projects data
const projects = [
  {
    title: 'Website Redesign',
    description: 'Complete redesign of the company website with modern UI/UX'
  },
  {
    title: 'Mobile App Development',
    description: 'Build a cross-platform mobile application'
  },
  {
    title: 'Marketing Campaign',
    description: 'Launch new marketing campaign for Q4'
  }
];

// Sample tasks data
const getTasks = (users, projects) => {
  const statuses = ['todo', 'in-progress', 'completed'];
  const priorities = ['low', 'medium', 'high'];
  
  const tasks = [];
  const today = new Date();
  
  // For each project, create 5-8 tasks
  projects.forEach((project, pIndex) => {
    const taskCount = Math.floor(Math.random() * 4) + 5; // 5-8 tasks per project
    
    for (let i = 0; i < taskCount; i++) {
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + Math.floor(Math.random() * 30) - 5); // -5 to +25 days
      
      tasks.push({
        title: `Task ${i + 1} for ${project.title}`,
        description: `This is a sample task for ${project.title}. Details and requirements go here.`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        dueDate,
        project: project._id,
        // Make task owner same as project owner so per-user stats match
        user: project.user
      });
    }
  });
  
  return tasks;
};

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    
    console.log('Data cleared successfully');
    
    // Create users
    const createdUsers = [];
    for (const user of users) {
      // Let the User model's pre-save hook hash the plain password
      const newUser = await User.create(user);
      createdUsers.push(newUser);
    }
    
    console.log('Users created:', createdUsers.length);
    
    // Create projects for each user
    const createdProjects = [];
    for (const user of createdUsers) {
      for (const project of projects) {
        const newProject = await Project.create({
          ...project,
          user: user._id
        });
        createdProjects.push(newProject);
      }
    }
    
    console.log('Projects created:', createdProjects.length);
    
    // Create tasks
    const allTasks = getTasks(createdUsers, createdProjects);
    const createdTasks = await Task.insertMany(allTasks);
    
    console.log('Tasks created:', createdTasks.length);
    
    console.log('Data import completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    
    console.log('Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
