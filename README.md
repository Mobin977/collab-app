# ⚡ CollabMesh Board — Real-Time Multi-Tenant Kanban SaaS Workspace

CollabMesh Board is a production-ready **real-time collaborative Kanban SaaS platform** designed for teams to manage projects, tasks, workspaces, and team activity.

The platform combines **React, TypeScript, Node.js, Express, PostgreSQL, Prisma, Redis, and Socket.IO** to provide a scalable full-stack collaboration experience.

## 🔗 Live Production Deployment

* 🌐 **Frontend:** https://collab-app-lilac.vercel.app/
* 📡 **Backend API:** https://collab-backend-api.onrender.com
* 💻 **GitHub:** https://github.com/Mobin977/collab-app

---

## ✨ Key Features

### 👥 Real-Time Collaboration

* Real-time task updates using Socket.IO
* Live board synchronization
* Multi-user workspace collaboration
* Real-time task movement and updates
* Event-driven client/server communication

### 📋 Kanban Workspace

* Create and manage workspaces
* Create and manage tasks
* Organize tasks by status
* Move tasks between Kanban columns
* Update task priorities
* Track workspace activity

### 🏢 Multi-Tenant Architecture

* Workspace-based data isolation
* Multiple users per workspace
* Role-based workspace access
* Organization-level separation
* Secure workspace-specific resources

### 🔐 Authentication & Security

* JWT-based authentication
* Protected API routes
* Role-based authorization
* Password hashing
* Request validation
* Environment-based secret management

### 📊 Analytics

* Workspace activity analytics
* Task status statistics
* Task velocity analysis
* PostgreSQL-based aggregation
* Relational analytics views

### ⚡ Redis Integration

Redis is used for fast-access state and caching workloads supporting the real-time collaboration architecture.

### 🔌 Socket.IO

Socket.IO provides event-driven communication between connected clients and the backend for real-time workspace synchronization.

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────────┐
                         │     React 19 Frontend    │
                         │   TypeScript + Vite      │
                         └────────────┬─────────────┘
                                      │
                              REST API / Socket.IO
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │    Node.js + Express     │
                         │       TypeScript         │
                         │                          │
                         │ JWT Authentication       │
                         │ RBAC Middleware          │
                         │ REST API                  │
                         │ Socket.IO Server         │
                         └───────┬──────────┬───────┘
                                 │          │
                       ┌─────────▼───┐  ┌──▼──────────┐
                       │ PostgreSQL  │  │    Redis    │
                       │   Prisma    │  │    Cache    │
                       └─────────────┘  └─────────────┘
```

---

## 🔄 Real-Time Event Flow

```text
User Action
     │
     ▼
React Frontend
     │
     ├──────────────► REST API
     │
     └──────────────► Socket.IO
                           │
                           ▼
                    Express Backend
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
            PostgreSQL             Redis
                 │                   │
                 └─────────┬─────────┘
                           ▼
                    Connected Clients
                           │
                           ▼
                  Real-Time UI Update
```

---

## 🛠️ Technology Stack

### Frontend

* React 19
* TypeScript
* Vite
* CSS
* Axios

### Backend

* Node.js
* Express.js
* TypeScript
* JWT
* Socket.IO

### Database

* PostgreSQL
* Prisma ORM

### Caching

* Redis

### Infrastructure

* Docker
* Docker Compose
* Nginx
* Vercel
* Render

---

## 📂 Project Structure

```text
collab-app/
│
├── collab-backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── prisma.ts
│   │   │   └── redis.ts
│   │   │
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.ts
│   │
│   └── package.json
│
├── collab-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   │
│   └── package.json
│
├── docker-compose.yml
├── tsconfig.json
└── README.md
```

---

## 🗄️ Database Architecture

The application uses **PostgreSQL** as the primary persistent data store.

Prisma ORM provides:

* Type-safe database access
* Relational data modeling
* Schema management
* Database migrations
* Transaction support
* Query abstraction

The database layer is responsible for persistent workspace, user, task, and analytics data.

---

## ⚡ Redis Architecture

Redis is used to support high-speed application workloads.

Typical use cases include:

* Cached workspace state
* Fast-access data
* Real-time collaboration support
* Temporary application state

---

## 🔐 Security

The application implements:

* JWT authentication
* Role-based authorization
* Protected routes
* Password hashing
* Request validation
* Workspace-level access control
* Database constraints
* Environment-based configuration

### Environment Security

Production secrets are configured through deployment environment variables rather than committed to GitHub.

Never commit:

```text
.env
.env.local
database passwords
JWT secrets
Redis credentials
API keys
production credentials
```

---

## 🐳 Run Locally

### Prerequisites

Install:

* Node.js
* Git
* Docker Desktop

### Clone

```bash
git clone https://github.com/Mobin977/collab-app.git

cd collab-app
```

### Start with Docker

```bash
docker compose up --build
```

### Local URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

## ⚙️ Environment Variables

Example backend configuration:

```env
DATABASE_URL=
JWT_SECRET=
PORT=5000
REDIS_URL=
CLIENT_URL=
```

Example frontend configuration:

```env
VITE_API_URL=
```

For production, configure these variables in the respective Vercel and Render environments.

---

## 🌐 Production Configuration

Frontend:

```text
https://collab-app-lilac.vercel.app/
```

Backend:

```text
https://collab-backend-api.onrender.com
```

Frontend API configuration:

```env
VITE_API_URL=https://collab-backend-api.onrender.com
```

---

## 📸 Screenshots

Add real screenshots of the deployed application.

### Login

```text
Add screenshot here
```

### Workspace Dashboard

```text
Add screenshot here
```

### Kanban Board

```text
Add screenshot here
```

### Real-Time Collaboration

```text
Add screenshot here
```

### Analytics

```text
Add screenshot here
```

---

## 📊 Engineering Highlights

This project demonstrates practical experience with:

* Full-stack SaaS architecture
* React 19
* TypeScript
* Node.js
* Express.js
* REST API development
* PostgreSQL
* Prisma ORM
* Redis
* Socket.IO
* Real-time collaboration
* JWT authentication
* RBAC
* Multi-tenant architecture
* Database analytics
* Docker
* Nginx
* Vercel
* Render

---

## 🎯 Why This Project

CollabMesh goes beyond a traditional CRUD application by demonstrating:

**Real-Time Systems**

Socket.IO enables connected users to receive workspace updates without relying on continuous polling.

**Multi-Tenant SaaS**

Workspace-level separation provides a foundation for supporting multiple teams and organizations.

**Scalable Backend**

The backend separates authentication, middleware, controllers, routes, persistence, caching, and real-time communication.

**Database Engineering**

PostgreSQL and Prisma provide structured relational storage and analytical capabilities.

**Caching**

Redis provides fast-access application state and caching capabilities.

**Cloud Deployment**

The application is deployed using Vercel and Render with Docker-based local development.

---

## 🚀 Future Improvements

* AI-powered task prioritization
* AI-generated project summaries
* Semantic search
* Advanced analytics
* Email notifications
* Push notifications
* File attachments
* Activity audit logs
* Elasticsearch integration
* Automated testing
* GitHub Actions CI/CD
* AWS deployment
* Kubernetes orchestration
* Horizontal backend scaling
* Redis Pub/Sub for distributed real-time scaling

---

## 👨‍💻 Author

**Mobin977**

Full-Stack Developer focused on building production-ready applications with:

**React • TypeScript • Node.js • Express • PostgreSQL • Prisma • Redis • Docker • Cloud Deployment**

---

## 🔗 Project Links

* 🌐 **Live Application:** https://collab-app-lilac.vercel.app/
* 📡 **Backend API:** https://collab-backend-api.onrender.com
* 💻 **GitHub:** https://github.com/Mobin977/collab-app

---

⭐ If you find this project useful, consider giving the repository a star!
