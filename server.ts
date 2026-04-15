import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { setupDB } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUrl = (url: string) => {
  if (!url) return true;
  try { new URL(url); return true; } catch { return false; }
};
const sanitize = (str: string) => {
  if (!str) return '';
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  const db = await setupDB();

  const logActivity = async (action: string, details: string) => {
    await db.run('INSERT INTO activity_logs (action, details) VALUES (?, ?)', [action, details]);
  };

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json());
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use('/api/', limiter);

  app.use(session({
    secret: 'cyber-portfolio-secure-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
  }));

  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;
      await logActivity('Login', `Successful login for user: ${username}`);
      res.json({ success: true });
    } else {
      await logActivity('Failed Login', `Failed attempt for user: ${username}`);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/auth/check', (req, res) => {
    if (req.session && req.session.userId) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.put('/api/admin/credentials', requireAuth, async (req, res) => {
    const { newUsername, newPassword } = req.body;
    if (!newUsername || !newPassword || newUsername.length < 3 || newPassword.length < 6) {
      return res.status(400).json({ error: 'Invalid credentials format' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET username = ?, password = ? WHERE id = ?', [sanitize(newUsername), hash, req.session.userId]);
    await logActivity('Credentials Updated', `Admin credentials changed to username: ${newUsername}`);
    res.json({ success: true });
  });

  // --- EXPERIENCES ---
  app.get('/api/experiences', async (req, res) => {
    const experiences = await db.all('SELECT * FROM experiences');
    res.json(experiences);
  });

  app.post('/api/experiences', requireAuth, async (req, res) => {
    const { role, organization, description, start_date, end_date, location } = req.body;
    if (!role || !organization || !description) return res.status(400).json({ error: 'Missing required fields' });
    if (role.length > 200 || organization.length > 200) return res.status(400).json({ error: 'Field too long' });

    const result = await db.run(
      'INSERT INTO experiences (role, organization, description, start_date, end_date, location) VALUES (?, ?, ?, ?, ?, ?)', 
      [sanitize(role), sanitize(organization), sanitize(description), sanitize(start_date || ''), sanitize(end_date || ''), sanitize(location || '')]
    );
    await logActivity('Experience Added', `Added experience: ${role} at ${organization}`);
    res.json({ id: result.lastID });
  });

  app.put('/api/experiences/:id', requireAuth, async (req, res) => {
    const { role, organization, description, start_date, end_date, location } = req.body;
    if (!role || !organization || !description) return res.status(400).json({ error: 'Missing required fields' });
    if (role.length > 200 || organization.length > 200) return res.status(400).json({ error: 'Field too long' });

    await db.run(
      'UPDATE experiences SET role = ?, organization = ?, description = ?, start_date = ?, end_date = ?, location = ? WHERE id = ?',
      [sanitize(role), sanitize(organization), sanitize(description), sanitize(start_date || ''), sanitize(end_date || ''), sanitize(location || ''), req.params.id]
    );
    await logActivity('Experience Edited', `Edited experience ID: ${req.params.id} (${role})`);
    res.json({ success: true });
  });

  app.delete('/api/experiences/:id', requireAuth, async (req, res) => {
    await db.run('DELETE FROM experiences WHERE id = ?', [req.params.id]);
    await logActivity('Experience Deleted', `Deleted experience ID: ${req.params.id}`);
    res.json({ success: true });
  });

  // --- PROJECTS ---
  app.get('/api/projects', async (req, res) => {
    const projects = await db.all('SELECT * FROM projects');
    res.json(projects);
  });

  app.post('/api/projects', requireAuth, async (req, res) => {
    const { title, desc, icon, tags, link, image_url } = req.body;
    if (!title || !desc || !link) return res.status(400).json({ error: 'Missing required fields' });
    if (!isValidUrl(link)) return res.status(400).json({ error: 'Invalid link URL' });
    if (image_url && !isValidUrl(image_url)) return res.status(400).json({ error: 'Invalid image URL' });

    const result = await db.run(
      'INSERT INTO projects (title, desc, icon, tags, link, image_url) VALUES (?, ?, ?, ?, ?, ?)', 
      [sanitize(title), sanitize(desc), sanitize(icon || '[PRJ]'), sanitize(tags || ''), link, image_url || null]
    );
    await logActivity('Project Added', `Added project: ${title}`);
    res.json({ id: result.lastID });
  });

  app.put('/api/projects/:id', requireAuth, async (req, res) => {
    const { title, desc, icon, tags, link, image_url } = req.body;
    if (!title || !desc || !link) return res.status(400).json({ error: 'Missing required fields' });
    if (!isValidUrl(link)) return res.status(400).json({ error: 'Invalid link URL' });
    if (image_url && !isValidUrl(image_url)) return res.status(400).json({ error: 'Invalid image URL' });

    await db.run(
      'UPDATE projects SET title = ?, desc = ?, icon = ?, tags = ?, link = ?, image_url = ? WHERE id = ?',
      [sanitize(title), sanitize(desc), sanitize(icon), sanitize(tags), link, image_url || null, req.params.id]
    );
    await logActivity('Project Edited', `Edited project ID: ${req.params.id} (${title})`);
    res.json({ success: true });
  });

  app.delete('/api/projects/:id', requireAuth, async (req, res) => {
    await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    await logActivity('Project Deleted', `Deleted project ID: ${req.params.id}`);
    res.json({ success: true });
  });

  // --- CERTS ---
  app.get('/api/certs', async (req, res) => {
    const certs = await db.all('SELECT * FROM certs');
    res.json(certs);
  });

  app.post('/api/certs', requireAuth, async (req, res) => {
    const { name, issuer, date, color } = req.body;
    if (!name || !issuer) return res.status(400).json({ error: 'Missing required fields' });
    
    const result = await db.run(
      'INSERT INTO certs (name, issuer, date, color) VALUES (?, ?, ?, ?)', 
      [sanitize(name), sanitize(issuer), sanitize(date || '—'), sanitize(color || 'var(--blue)')]
    );
    await logActivity('Cert Added', `Added certification: ${name}`);
    res.json({ id: result.lastID });
  });

  app.put('/api/certs/:id', requireAuth, async (req, res) => {
    const { name, issuer, date, color } = req.body;
    if (!name || !issuer) return res.status(400).json({ error: 'Missing required fields' });

    await db.run(
      'UPDATE certs SET name = ?, issuer = ?, date = ?, color = ? WHERE id = ?',
      [sanitize(name), sanitize(issuer), sanitize(date), sanitize(color), req.params.id]
    );
    await logActivity('Cert Edited', `Edited certification ID: ${req.params.id} (${name})`);
    res.json({ success: true });
  });

  app.delete('/api/certs/:id', requireAuth, async (req, res) => {
    await db.run('DELETE FROM certs WHERE id = ?', [req.params.id]);
    await logActivity('Cert Deleted', `Deleted certification ID: ${req.params.id}`);
    res.json({ success: true });
  });

  // --- MESSAGES ---
  app.post('/api/messages', async (req, res) => {
    const { email, phone, message } = req.body;
    if (!email || !message) return res.status(400).json({ error: 'Email and message required' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (message.length > 2000) return res.status(400).json({ error: 'Message too long' });

    await db.run(
      'INSERT INTO messages (email, phone, message) VALUES (?, ?, ?)', 
      [sanitize(email), sanitize(phone || ''), sanitize(message)]
    );
    res.json({ success: true });
  });

  app.get('/api/messages', requireAuth, async (req, res) => {
    const messages = await db.all('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(messages);
  });

  app.put('/api/messages/:id/status', requireAuth, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['unread', 'read', 'pending', 'archived'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    await db.run('UPDATE messages SET status = ? WHERE id = ?', [status, req.params.id]);
    await logActivity('Message Status Updated', `Message ID ${req.params.id} marked as ${status}`);
    res.json({ success: true });
  });

  // --- LOGS ---
  app.get('/api/logs', requireAuth, async (req, res) => {
    const logs = await db.all('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50');
    res.json(logs);
  });

  // --- VITE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
