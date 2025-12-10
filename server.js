const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');
const cookieParser = require('cookie-parser');
// Custom sanitization function to replace express-mongo-sanitize
const sanitize = (req, res, next) => {
  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === 'object') {
        clean(obj[key]);
      } else if (key.includes('$') || (typeof obj[key] === 'string' && obj[key].includes('$'))) {
        // Replace $ and . with _ to prevent NoSQL injection
        const newKey = key.replace(/\$/g, '_');
        if (newKey !== key) {
          obj[newKey] = obj[key];
          delete obj[key];
        }
        if (typeof obj[newKey] === 'string') {
          obj[newKey] = obj[newKey].replace(/\$/g, '_');
        }
      }
    });
    return obj;
  };

  // Clean request body, query, and params
  if (req.body) req.body = clean(JSON.parse(JSON.stringify(req.body)));
  if (req.query) req.query = clean(JSON.parse(JSON.stringify(req.query)));
  if (req.params) req.params = clean(JSON.parse(JSON.stringify(req.params)));
  
  next();
};
const helmet = require('helmet');
// xss is now handled by helmet
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerConfig = require('./utils/swagger/swagger');

// Enable colors
colors.enable();

// Load environment variables
dotenv.config({ path: './.env' });

// Route files
const auth = require('./routes/auth');
const projects = require('./routes/projects');
const tasks = require('./routes/tasks');
const dashboard = require('./routes/dashboard');

// Create Express app
const app = express();

// Body parser - must come before other middleware
app.use(express.json());

// Cookie parser - must come before other middleware
app.use(cookieParser());

// Set security headers with helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:']
      }
    },
    xssFilter: true, // Enable XSS filter
    noSniff: true,   // Prevent MIME type sniffing
    hidePoweredBy: true, // Hide X-Powered-By header
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    }
  })
);

// Use custom sanitization middleware
app.use(sanitize);

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS with dynamic origin allowlist and credentials
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (e.g., curl/postman with no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight safely for Express v5
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/projects', projects);
app.use('/api/v1/tasks', tasks);
app.use('/api/v1/dashboard', dashboard);

// Error handling middleware
const errorHandler = require('./middleware/error');
app.use(errorHandler);

// Swagger documentation
swaggerConfig(app);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 10, // Maximum number of connections in the connection pool
    wtimeoutMS: 2500, // Write concern timeout
    w: 'majority' // Write concern
})
.then(() => console.log('MongoDB connected'.cyan.underline.bold))
.catch(err => {
    console.error('MongoDB connection error:'.red, err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
});
