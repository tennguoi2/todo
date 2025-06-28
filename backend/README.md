# Todo App Backend

A RESTful API backend for the Todo App built with Node.js, Express, and MySQL.

## Features

- User authentication (JWT + Google OAuth)
- Task management (CRUD operations)
- Project organization
- Focus sessions (Pomodoro technique)
- Statistics and analytics
- Settings management
- Real-time data synchronization

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate limiting

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Create MySQL database:
```sql
CREATE DATABASE todo_app;
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | MySQL host | localhost |
| `DB_PORT` | MySQL port | 3306 |
| `DB_NAME` | Database name | todo_app |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | |
| `JWT_SECRET` | JWT secret key | |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `CORS_ORIGIN` | Allowed origins | * |

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/google` - Sign in with Google
- `POST /api/auth/signout` - Sign out

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Toggle task completion
- `GET /api/tasks/statistics` - Get task statistics

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/tasks` - Get project tasks

### Focus Sessions
- `GET /api/focus/sessions` - Get focus sessions
- `POST /api/focus/sessions` - Create focus session
- `PUT /api/focus/sessions/:id/complete` - Complete session
- `GET /api/focus/statistics` - Get focus statistics
- `GET /api/focus/settings` - Get focus settings
- `PUT /api/focus/settings` - Update focus settings

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Settings
- `GET /api/settings/notifications` - Get notification settings
- `PUT /api/settings/notifications` - Update notification settings
- `GET /api/settings/theme` - Get theme settings
- `PUT /api/settings/theme` - Update theme settings

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `projects` - Project organization
- `tasks` - Task management
- `task_tags` - Task tagging system
- `focus_sessions` - Focus session tracking
- `focus_settings` - User focus preferences
- `notification_settings` - Notification preferences
- `theme_settings` - Theme preferences

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention

## Error Handling

All API responses follow a consistent format:

```json
{
  "success": true/false,
  "data": {},
  "message": "Description",
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Development

### Running Tests
```bash
npm test
```

### Database Migration
```bash
npm run db:migrate
```

### Seeding Data
```bash
npm run db:seed
```

## Deployment

### Railway (Recommended)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

### Docker
```bash
docker build -t todo-app-backend .
docker run -p 3000:3000 todo-app-backend
```

### Manual Deployment
1. Set up MySQL database
2. Configure environment variables
3. Install dependencies: `npm install --production`
4. Start server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
