# Team Task Manager

A full-stack, production-ready project management application featuring real-time task tracking, detailed analytics, system-wide dark mode, and a comprehensive notification engine.

## 🚀 Features

- **Advanced Role-Based Access Control (RBAC)**: Secure separation between Admins (full workspace control) and Members (project-specific access).
- **Kanban Board**: Drag-and-drop task management inspired by Trello and Jira.
- **Analytics Dashboard**: Visualized workspace throughput using Recharts (Pie and Bar charts).
- **Systemic Dark Mode**: Toggleable light/dark themes powered by Tailwind CSS and React Context.
- **Real-Time Notifications**: Keep track of task assignments and project deadlines with an unread badge notification system.
- **Robust Security**: JWT-based authentication, bcrypt password hashing, and express-validator request sanitization.

## 🛠 Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Recharts, `react-hot-toast`, `@hello-pangea/dnd`
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Deployment Ready**: Vercel (Frontend), Railway (Backend/DB)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL (running locally)

### 1. Database Setup
Ensure PostgreSQL is running. Create a new database named `taskmanager`.

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/taskmanager?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
FRONTEND_URL="http://localhost:5173"
```
Run Prisma migrations and seed the database:
```bash
npx prisma migrate dev
npx prisma db seed
```
Start the development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL="http://localhost:5000/api"
```
Start the Vite dev server:
```bash
npm run dev
```

---

## 🔐 Demo Credentials (Seeded)

If you ran the Prisma seed command, the following accounts are available for testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `password123` |
| **Member** | `john@example.com` | `password123` |

---

## 🌍 Production Deployment Guide

### Backend & Database (Railway)
1. Link your GitHub repository to Railway.
2. Provision a **PostgreSQL** database instance in your Railway project.
3. Deploy the backend folder as a Node.js web service.
4. Set the following Environment Variables in Railway:
   - `DATABASE_URL` (Use the private connection string from your provisioned DB)
   - `JWT_SECRET` (Generate a strong random string)
   - `FRONTEND_URL` (Set this to your Vercel deployment URL, e.g., `https://my-task-manager.vercel.app`)
5. *Note: Railway automatically assigns the `PORT` variable.*

### Frontend (Vercel)
1. Import your GitHub repository into Vercel.
2. Set the **Framework Preset** to Vite.
3. Set the Root Directory to `frontend`.
4. Set the following Environment Variable in Vercel:
   - `VITE_API_URL` (Set this to your Railway deployment URL, e.g., `https://my-backend-service.up.railway.app/api`)
5. Deploy! Vercel will automatically read the included `vercel.json` to handle client-side routing rewrites.

---

## 📖 API Documentation

The backend exposes a RESTful API mounted at `/api`. All protected routes require a Bearer token in the `Authorization` header.

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Authenticate user & get token
- `GET /me` - Get current user profile

### Projects (`/api/projects`)
- `GET /` - Get all projects (Admins see all, Members see assigned)
- `POST /` - Create a project (Admin only)
- `GET /:id` - Get single project details
- `PUT /:id` - Update project details (Admin only)
- `DELETE /:id` - Delete project (Admin only)
- `POST /:id/members` - Manage project members (Admin only)

### Tasks (`/api/tasks`)
- `POST /projects/:projectId/tasks` - Create a task
- `GET /projects/:projectId/tasks` - Get tasks for a project
- `PUT /:id` - Update a task
- `DELETE /:id` - Delete a task
- `PUT /:id/status` - Update task status (for Kanban drag & drop)
- `POST /:id/comments` - Add a comment to a task
- `GET /:id/comments` - Get comments for a task

### Analytics (`/api/analytics`)
- `GET /` - Get aggregated dashboard metrics (Admin only)

### Notifications (`/api/notifications`)
- `GET /` - Get current user notifications
- `PUT /:id/read` - Mark a specific notification as read
- `PUT /read-all` - Mark all notifications as read
