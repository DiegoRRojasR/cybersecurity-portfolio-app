# Cybersecurity Portfolio App

A full-stack cybersecurity portfolio web application built with **React**, **Vite**, **Node.js**, **Express**, and **SQLite**.

This project includes a public portfolio, an admin dashboard, authentication, session handling, database persistence, and security-oriented features designed for academic **SAST**, **DAST**, **Docker**, and **Trivy** testing.

---

## Links

- **GitHub Repository:** https://github.com/DiegoRRojasR/cybersecurity-portfolio-app
- **Docker Hub:** https://hub.docker.com/r/diegorojasrr/cybersecurity-portfolio-app

---

## Features

- Public cybersecurity portfolio
- Admin login and session-based authentication
- SQLite database
- CRUD for projects, certifications, and experiences
- Contact form with message management
- Activity logs
- Input validation and sanitization
- Rate limiting and security headers
- Docker support

---

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite
- **Authentication:** express-session + bcrypt

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run the application

```bash
npm run dev
```

### 3. Open in browser

- **Portfolio:** `http://localhost:3000`
- **Admin panel:** `http://localhost:3000/admin`

---

## Docker

### Build the image

```bash
docker build -t cyber-portfolio .
```

### Run the container

```bash
docker run -d -p 3000:3000 --name cyber-portfolio cyber-portfolio
```

---

## Run with Docker Hub Image

### Pull image

```bash
docker pull diegorojasrr/cybersecurity-portfolio-app:latest
```

### Run container

```bash
docker run -d -p 3000:3000 --name cyber-portfolio-app diegorojasrr/cybersecurity-portfolio-app:latest
```

### Run container with persistent SQLite volume

```bash
docker run -d -p 3000:3000 -v "${PWD}/database.sqlite:/app/database.sqlite" --name cyber-portfolio-app diegorojasrr/cybersecurity-portfolio-app:latest
```

### Open in browser

- **Portfolio:** `http://localhost:3000`
- **Admin panel:** `http://localhost:3000/admin`

---

## Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

---

## Main Functionalities

### Public Portfolio

- About Me
- Experience
- Skills
- Certifications
- Projects
- Contact form

### Admin Dashboard

- Login / Logout
- Manage experiences
- Manage projects
- Manage certifications
- View contact messages
- Update message status
- View activity logs
- Update admin credentials

---

## API Routes

### Authentication

- `POST /api/login`
- `POST /api/logout`
- `GET /api/auth/check`

### Experiences

- `GET /api/experiences`
- `POST /api/experiences`
- `PUT /api/experiences/:id`
- `DELETE /api/experiences/:id`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

### Certifications

- `GET /api/certs`
- `POST /api/certs`
- `PUT /api/certs/:id`
- `DELETE /api/certs/:id`

### Messages

- `POST /api/messages`
- `GET /api/messages`
- `PUT /api/messages/:id/status`

### Admin

- `PUT /api/admin/credentials`

### Logs

- `GET /api/logs`

---

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Route protection for admin actions
- Input validation
- Input sanitization
- Rate limiting
- Security headers with Helmet
- Auto logout after inactivity
- Activity logging

---

## Academic Purpose

This application was created as an individual cybersecurity-related academic project to support:

- Static Application Security Testing (SAST)
- Dynamic Application Security Testing (DAST)
- Docker containerization
- Docker Hub publication
- Container vulnerability scanning with Trivy

It was designed to include authentication, session management, database persistence, frontend validation, and admin functionality for security evaluation.

---

## Author

**Diego Rafael Rojas Reyes**  
GitHub: [DiegoRRojasR](https://github.com/DiegoRRojasR)
