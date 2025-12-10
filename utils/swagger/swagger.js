const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API documentation for Task Management System',
      contact: {
        name: 'API Support',
        email: 'support@taskmanager.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://your-production-url.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user'
            }
          }
        },
        Project: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 100,
              example: 'Website Redesign'
            },
            description: {
              type: 'string',
              minLength: 10,
              example: 'Redesign the company website with modern UI/UX'
            }
          }
        },
        Task: {
          type: 'object',
          required: ['title', 'description', 'project', 'dueDate'],
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 100,
              example: 'Design Homepage'
            },
            description: {
              type: 'string',
              minLength: 10,
              example: 'Design the new homepage layout'
            },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'completed'],
              default: 'todo',
              example: 'in-progress'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium',
              example: 'high'
            },
            dueDate: {
              type: 'string',
              format: 'date',
              example: '2023-12-31'
            },
            project: {
              type: 'string',
              format: 'mongo-id',
              example: '5f8d0f4d7f4f4e4d4f8d0f4d'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Resource not found'
            },
            errors: {
              type: 'object',
              example: {
                field: 'Error message'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Swagger docs available at http://localhost:${process.env.PORT || 5000}/api-docs`);
};

module.exports = swaggerDocs;
