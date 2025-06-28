# Backend Server Setup Guide

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcrypt
- **ORM**: Sequelize or Prisma
- **Validation**: Joi or Yup
- **Environment**: dotenv

## Required Dependencies

```bash
npm init -y
npm install express mysql2 sequelize bcryptjs jsonwebtoken cors helmet dotenv
npm install express-rate-limit express-validator morgan compression
npm install --save-dev nodemon
```

## Environment Variables (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_app
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://your-frontend-domain.com
```

## Basic Server Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── auth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── projectController.js
│   │   └── focusController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Project.js
│   │   └── FocusSession.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── projects.js
│   │   └── focus.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── taskService.js
│   │   └── emailService.js
│   ├── utils/
│   │   ├── helpers.js
│   │   └── constants.js
│   └── app.js
├── database/
│   └── schema.sql
├── .env
├── .gitignore
└── server.js
```

## Sample Implementation Files

### server.js
```javascript
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### src/app.js
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const focusRoutes = require('./routes/focus');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/focus', focusRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

module.exports = app;
```

### src/config/database.js
```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
```

### src/middleware/auth.js
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access token required'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid access token'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_ERROR',
        message: 'Token verification failed'
      }
    });
  }
};

module.exports = { authenticateToken };
```

## Database Connection Test

```javascript
// src/config/testConnection.js
const sequelize = require('./database');

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();
```

## Deployment Options

### 1. Railway (Recommended)
- Easy MySQL database setup
- Automatic deployments from GitHub
- Environment variable management

### 2. Heroku + PlanetScale
- Free tier available
- Serverless MySQL database
- Easy scaling

### 3. DigitalOcean App Platform
- Managed database options
- Automatic SSL certificates
- Built-in monitoring

### 4. AWS (Advanced)
- EC2 + RDS MySQL
- Lambda + Aurora Serverless
- Full control and scalability

## Next Steps

1. Set up your MySQL database using the provided schema
2. Create the backend server with the structure above
3. Implement the API endpoints according to the documentation
4. Test the endpoints using Postman or similar tools
5. Update your React Native app to use the API instead of AsyncStorage
6. Deploy to your chosen platform

## Security Considerations

- Use HTTPS in production
- Implement proper input validation
- Use parameterized queries to prevent SQL injection
- Implement rate limiting
- Use secure JWT secrets
- Hash passwords with bcrypt
- Implement proper CORS policies
- Use environment variables for sensitive data
