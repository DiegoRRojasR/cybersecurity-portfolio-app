# Cyber Portfolio

A full-stack cybersecurity portfolio built with React, Vite, Node.js, Express, and SQLite.

## Features
- Dynamic portfolio sections (Projects, Certifications, Skills)
- Boot sequence animation
- Contact form
- Protected Admin Dashboard
- SQLite Database
- Session-based authentication
- Rate limiting & Security Headers
- Docker ready

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Docker Deployment

Build the image:
```bash
docker build -t cyber-portfolio .
```

Run the container (with persistent database volume):
```bash
docker run -d -p 3000:3000 -v ${PWD}/database.sqlite:/app/database.sqlite --name portfolio cyber-portfolio
```

## Admin Access
- **URL:** `/admin`
- **Default Username:** `admin`
- **Default Password:** `admin123`
