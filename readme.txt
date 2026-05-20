Team Task Manager

A full-stack, production-ready project management application featuring real-time task tracking, detailed analytics, system-wide dark mode, and a notification engine.

Features
- Advanced role-based access control: Secure separation between Admins and Members.
- Kanban board: Drag-and-drop task management inspired by Trello and Jira.
- Analytics dashboard: Visualized workspace throughput using Recharts.
- System dark mode: Toggleable light and dark themes powered by Tailwind CSS and React Context.
- Real-time notifications: Track task assignments and deadlines with unread badges.
- Security: JWT authentication, bcrypt password hashing, and express-validator request sanitization.

Tech Stack
- Frontend: React.js with Vite, Tailwind CSS, Recharts, react-hot-toast, and @hello-pangea/dnd
- Backend: Node.js and Express.js
- Database: PostgreSQL with Prisma ORM
- Deployment: Vercel for the frontend, Railway for the backend and database

Local Development Setup

Prerequisites
- Node.js v16 or newer
- PostgreSQL running locally

Database Setup
- Create a PostgreSQL database named taskmanager.

Backend Setup
- Go to the backend folder.
- Install dependencies with npm install.
- Create a .env file in backend with:
  PORT=5000
  DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/taskmanager?schema=public
  JWT_SECRET=your_super_secret_jwt_key_here
  FRONTEND_URL=http://localhost:5173
- Run Prisma migrations with npx prisma migrate dev.
- Seed the database with npx prisma db seed.
- Start the backend with npm run dev.

Frontend Setup
- Go to the frontend folder.
- Install dependencies with npm install.
- Create a .env file in frontend with:
  VITE_API_URL=http://localhost:5000/api
- Start the frontend with npm run dev.

Demo Credentials
- Admin: admin@example.com / password123
- Member: john@example.com / password123

Production Deployment Guide

Backend and Database on Railway
- Link the GitHub repository to Railway.
- Add a PostgreSQL database in the Railway project.
- Deploy the backend folder as a Node.js web service.
- Set environment variables:
  DATABASE_URL = Railway database connection string
  JWT_SECRET = strong random string
  FRONTEND_URL = your Vercel deployment URL, such as https://my-task-manager.vercel.app
- Railway provides PORT automatically.
- Run npx prisma migrate deploy after the first deploy.
- If needed, run node prisma/seed.js once to load demo data.

Frontend on Vercel
- Import the GitHub repository into Vercel.
- Set the framework preset to Vite.
- Set the root directory to frontend.
- Set the environment variable:
  VITE_API_URL = your Railway backend URL, such as https://my-backend-service.up.railway.app/api
- Deploy the app.
- The app already includes routing rewrites for client-side navigation.

API Endpoints
- Authentication: /api/auth
  - POST /register
  - POST /login
  - GET /me
- Projects: /api/projects
  - GET /
  - POST /
  - GET /:id
  - PUT /:id
  - DELETE /:id
  - POST /:id/members
- Tasks: /api/tasks
  - POST /projects/:projectId/tasks
  - GET /projects/:projectId/tasks
  - PUT /:id
  - DELETE /:id
  - PUT /:id/status
  - POST /:id/comments
  - GET /:id/comments
- Analytics: /api/analytics
  - GET /
- Notifications: /api/notifications
  - GET /
  - PUT /:id/read
  - PUT /read-all
