import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Search & Filter
  const [searchProject, setSearchProject] = useState('');
  const [filterCert, setFilterCert] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  // Forms
  const [expForm, setExpForm] = useState({ id: null, role: '', organization: '', description: '', start_date: '', end_date: '', location: '' });
  const [projForm, setProjForm] = useState({ id: null, title: '', desc: '', icon: '[PRJ]', tags: '', link: '', image_url: '' });
  const [certForm, setCertForm] = useState({ id: null, name: '', issuer: '', date: '', color: 'var(--blue)' });
  const [credForm, setCredForm] = useState({ newUsername: '', newPassword: '' });
  const [credMsg, setCredMsg] = useState('');

  // Auto-logout timer
  useEffect(() => {
    if (!auth) return;
    let timeout: NodeJS.Timeout;
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handleLogout(), 15 * 60 * 1000); // 15 mins
    };
    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keydown', resetTimeout);
    resetTimeout();
    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keydown', resetTimeout);
      clearTimeout(timeout);
    };
  }, [auth]);

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(data => {
      if (data.authenticated) {
        setAuth(true);
        loadData();
      }
    });
  }, []);

  const loadData = () => {
    fetch('/api/experiences').then(r => r.json()).then(setExperiences);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
    fetch('/api/certs').then(r => r.json()).then(setCerts);
    fetch('/api/messages').then(r => r.json()).then(setMessages);
    fetch('/api/logs').then(r => r.json()).then(setLogs);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      setAuth(true);
      loadData();
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setAuth(false);
  };

  // --- Experiences ---
  const saveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = expForm.id ? 'PUT' : 'POST';
    const url = expForm.id ? `/api/experiences/${expForm.id}` : '/api/experiences';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expForm)
    });
    setExpForm({ id: null, role: '', organization: '', description: '', start_date: '', end_date: '', location: '' });
    loadData();
  };

  const editExperience = (exp: any) => setExpForm(exp);

  const deleteExperience = async (id: number) => {
    if (confirm('Are you sure you want to delete this experience?')) {
      await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  // --- Projects ---
  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = projForm.id ? 'PUT' : 'POST';
    const url = projForm.id ? `/api/projects/${projForm.id}` : '/api/projects';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projForm)
    });
    setProjForm({ id: null, title: '', desc: '', icon: '[PRJ]', tags: '', link: '', image_url: '' });
    loadData();
  };

  const editProject = (p: any) => setProjForm(p);

  const deleteProject = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  // --- Certs ---
  const saveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = certForm.id ? 'PUT' : 'POST';
    const url = certForm.id ? `/api/certs/${certForm.id}` : '/api/certs';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certForm)
    });
    setCertForm({ id: null, name: '', issuer: '', date: '', color: 'var(--blue)' });
    loadData();
  };

  const editCert = (c: any) => setCertForm(c);

  const deleteCert = async (id: number) => {
    if (confirm('Are you sure you want to delete this certification?')) {
      await fetch(`/api/certs/${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  // --- Messages ---
  const updateMessageStatus = async (id: number, status: string) => {
    await fetch(`/api/messages/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadData();
  };

  // --- Credentials ---
  const updateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/credentials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credForm)
    });
    if (res.ok) {
      setCredMsg('Credentials updated successfully.');
      setCredForm({ newUsername: '', newPassword: '' });
      loadData();
    } else {
      setCredMsg('Error updating credentials.');
    }
  };

  if (!auth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <form onSubmit={handleLogin} style={{ background: 'var(--mantle)', padding: '40px', border: '1px solid var(--surface0)', display: 'flex', flexDirection: 'column', gap: '20px', width: '300px' }}>
          <h2 style={{ color: 'var(--green)', textAlign: 'center' }}>Admin Login</h2>
          {error && <div style={{ color: 'var(--red)', fontSize: '12px', textAlign: 'center' }}>{error}</div>}
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '10px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)' }} />
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>Login</button>
        </form>
      </div>
    );
  }

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchProject.toLowerCase()));
  const filteredCerts = certs.filter(c => c.name.toLowerCase().includes(filterCert.toLowerCase()));
  const filteredMessages = messages.filter(m => m.email.toLowerCase().includes(searchMessage.toLowerCase()));
  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--green)' }}>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
      </div>

      {/* SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--mantle)', padding: '20px', border: '1px solid var(--surface0)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: 'var(--teal)' }}>{experiences.length}</div>
          <div style={{ color: 'var(--subtext0)' }}>Experiences</div>
        </div>
        <div style={{ background: 'var(--mantle)', padding: '20px', border: '1px solid var(--surface0)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: 'var(--blue)' }}>{projects.length}</div>
          <div style={{ color: 'var(--subtext0)' }}>Projects</div>
        </div>
        <div style={{ background: 'var(--mantle)', padding: '20px', border: '1px solid var(--surface0)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: 'var(--yellow)' }}>{certs.length}</div>
          <div style={{ color: 'var(--subtext0)' }}>Certifications</div>
        </div>
        <div style={{ background: 'var(--mantle)', padding: '20px', border: '1px solid var(--surface0)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: 'var(--mauve)' }}>{messages.length}</div>
          <div style={{ color: 'var(--subtext0)' }}>Messages</div>
        </div>
        <div style={{ background: 'var(--mantle)', padding: '20px', border: '1px solid var(--surface0)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: unreadCount > 0 ? 'var(--red)' : 'var(--green)' }}>{unreadCount}</div>
          <div style={{ color: 'var(--subtext0)' }}>Unread</div>
        </div>
      </div>

      {/* MESSAGES */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: 'var(--mauve)', borderBottom: '1px solid var(--surface0)', paddingBottom: '10px', marginBottom: '20px' }}>Messages</h2>
        <input type="text" placeholder="Search by email..." value={searchMessage} onChange={e => setSearchMessage(e.target.value)} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', marginBottom: '20px', width: '100%', maxWidth: '300px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredMessages.map(m => (
            <div key={m.id} style={{ background: 'var(--mantle)', padding: '15px', border: '1px solid var(--surface0)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'var(--subtext0)', fontSize: '12px', marginBottom: '10px' }}>{m.created_at} | {m.email} | {m.phone}</div>
                <div style={{ color: 'var(--text)' }}>{m.message}</div>
              </div>
              <select value={m.status} onChange={e => updateMessageStatus(m.id, e.target.value)} style={{ padding: '5px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: m.status === 'unread' ? 'var(--red)' : 'var(--text)' }}>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="pending">Pending</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          ))}
          {filteredMessages.length === 0 && <div style={{ color: 'var(--subtext0)' }}>No messages found.</div>}
        </div>
      </section>

      {/* EXPERIENCES */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: 'var(--teal)', borderBottom: '1px solid var(--surface0)', paddingBottom: '10px', marginBottom: '20px' }}>Experiences</h2>
        
        <form onSubmit={saveExperience} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', background: 'var(--mantle)', padding: '20px', border: '1px solid var(--surface0)' }}>
          <h3 style={{ width: '100%', marginBottom: '10px', color: 'var(--text)' }}>{expForm.id ? 'Edit Experience' : 'Add New Experience'}</h3>
          <input required type="text" placeholder="Role" value={expForm.role} onChange={e => setExpForm({...expForm, role: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '1 1 200px' }} />
          <input required type="text" placeholder="Organization" value={expForm.organization} onChange={e => setExpForm({...expForm, organization: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '1 1 200px' }} />
          <input type="text" placeholder="Start Date" value={expForm.start_date} onChange={e => setExpForm({...expForm, start_date: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '1 1 150px' }} />
          <input type="text" placeholder="End Date" value={expForm.end_date} onChange={e => setExpForm({...expForm, end_date: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '1 1 150px' }} />
          <input type="text" placeholder="Location" value={expForm.location} onChange={e => setExpForm({...expForm, location: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '1 1 150px' }} />
          <textarea required placeholder="Description" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '1 1 100%', minHeight: '80px' }} />
          <button type="submit" className="btn btn-primary">{expForm.id ? 'Update' : 'Add'}</button>
          {expForm.id && <button type="button" onClick={() => setExpForm({ id: null, role: '', organization: '', description: '', start_date: '', end_date: '', location: '' })} className="btn btn-secondary">Cancel</button>}
        </form>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface0)', color: 'var(--subtext0)' }}>
              <th style={{ padding: '10px' }}>Role</th>
              <th style={{ padding: '10px' }}>Organization</th>
              <th style={{ padding: '10px' }}>Dates</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map(exp => (
              <tr key={exp.id} style={{ borderBottom: '1px solid var(--surface0)' }}>
                <td style={{ padding: '10px', color: 'var(--text)' }}>{exp.role}</td>
                <td style={{ padding: '10px', color: 'var(--subtext1)' }}>{exp.organization}</td>
                <td style={{ padding: '10px', color: 'var(--subtext1)' }}>{exp.start_date} - {exp.end_date || 'Present'}</td>
                <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editExperience(exp)} style={{ color: 'var(--yellow)', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteExperience(exp.id)} style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* PROJECTS */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: 'var(--blue)', borderBottom: '1px solid var(--surface0)', paddingBottom: '10px', marginBottom: '20px' }}>Projects</h2>
        
        <form onSubmit={saveProject} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', background: 'var(--mantle)', padding: '20px', border: '1px solid var(--surface0)' }}>
          <h3 style={{ width: '100%', marginBottom: '10px', color: 'var(--text)' }}>{projForm.id ? 'Edit Project' : 'Add New Project'}</h3>
          <input required type="text" placeholder="Title" value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '1 1 200px' }} />
          <input required type="text" placeholder="Description" value={projForm.desc} onChange={e => setProjForm({...projForm, desc: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '2 1 300px' }} />
          <input required type="text" placeholder="Link URL" value={projForm.link} onChange={e => setProjForm({...projForm, link: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '1 1 200px' }} />
          <input type="text" placeholder="Tags (comma separated)" value={projForm.tags} onChange={e => setProjForm({...projForm, tags: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '1 1 200px' }} />
          <input type="text" placeholder="Image URL (Optional)" value={projForm.image_url} onChange={e => setProjForm({...projForm, image_url: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: '1 1 200px' }} />
          <button type="submit" className="btn btn-primary">{projForm.id ? 'Update' : 'Add'}</button>
          {projForm.id && <button type="button" onClick={() => setProjForm({ id: null, title: '', desc: '', icon: '[PRJ]', tags: '', link: '', image_url: '' })} className="btn btn-secondary">Cancel</button>}
        </form>

        <input type="text" placeholder="Search projects..." value={searchProject} onChange={e => setSearchProject(e.target.value)} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', marginBottom: '20px', width: '100%', maxWidth: '300px' }} />

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface0)', color: 'var(--subtext0)' }}>
              <th style={{ padding: '10px' }}>Title</th>
              <th style={{ padding: '10px' }}>Link</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--surface0)' }}>
                <td style={{ padding: '10px', color: 'var(--text)' }}>{p.title}</td>
                <td style={{ padding: '10px', color: 'var(--blue)' }}><a href={p.link} target="_blank" rel="noreferrer">Link</a></td>
                <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editProject(p)} style={{ color: 'var(--yellow)', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteProject(p.id)} style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* CERTS */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: 'var(--yellow)', borderBottom: '1px solid var(--surface0)', paddingBottom: '10px', marginBottom: '20px' }}>Certifications</h2>
        
        <form onSubmit={saveCert} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', background: 'var(--mantle)', padding: '20px', border: '1px solid var(--surface0)' }}>
          <h3 style={{ width: '100%', marginBottom: '10px', color: 'var(--text)' }}>{certForm.id ? 'Edit Certification' : 'Add New Certification'}</h3>
          <input required type="text" placeholder="Name" value={certForm.name} onChange={e => setCertForm({...certForm, name: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: 1 }} />
          <input required type="text" placeholder="Issuer" value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: 1 }} />
          <input type="text" placeholder="Date" value={certForm.date} onChange={e => setCertForm({...certForm, date: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', flex: 1 }} />
          <select value={certForm.color} onChange={e => setCertForm({...certForm, color: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)' }}>
            <option value="var(--blue)">Blue</option>
            <option value="var(--green)">Green</option>
            <option value="var(--red)">Red</option>
            <option value="var(--yellow)">Yellow</option>
            <option value="var(--peach)">Peach</option>
            <option value="var(--teal)">Teal</option>
          </select>
          <button type="submit" className="btn btn-primary">{certForm.id ? 'Update' : 'Add'}</button>
          {certForm.id && <button type="button" onClick={() => setCertForm({ id: null, name: '', issuer: '', date: '', color: 'var(--blue)' })} className="btn btn-secondary">Cancel</button>}
        </form>

        <input type="text" placeholder="Filter certifications..." value={filterCert} onChange={e => setFilterCert(e.target.value)} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)', marginBottom: '20px', width: '100%', maxWidth: '300px' }} />

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface0)', color: 'var(--subtext0)' }}>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>Issuer</th>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCerts.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--surface0)' }}>
                <td style={{ padding: '10px', color: 'var(--text)' }}>{c.name}</td>
                <td style={{ padding: '10px', color: 'var(--subtext1)' }}>{c.issuer}</td>
                <td style={{ padding: '10px', color: 'var(--subtext1)' }}>{c.date}</td>
                <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editCert(c)} style={{ color: 'var(--yellow)', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteCert(c.id)} style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* CREDENTIALS & LOGS */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <section style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ color: 'var(--red)', borderBottom: '1px solid var(--surface0)', paddingBottom: '10px', marginBottom: '20px' }}>Admin Credentials</h2>
          <form onSubmit={updateCredentials} style={{ background: 'var(--mantle)', padding: '20px', border: '1px solid var(--surface0)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input required minLength={3} type="text" placeholder="New Username" value={credForm.newUsername} onChange={e => setCredForm({...credForm, newUsername: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)' }} />
            <input required minLength={6} type="password" placeholder="New Password" value={credForm.newPassword} onChange={e => setCredForm({...credForm, newPassword: e.target.value})} style={{ padding: '8px', background: 'var(--crust)', border: '1px solid var(--surface0)', color: 'var(--text)' }} />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Credentials</button>
            {credMsg && <div style={{ color: 'var(--green)', fontSize: '12px' }}>{credMsg}</div>}
          </form>
        </section>

        <section style={{ flex: 2, minWidth: '300px' }}>
          <h2 style={{ color: 'var(--teal)', borderBottom: '1px solid var(--surface0)', paddingBottom: '10px', marginBottom: '20px' }}>Activity Logs</h2>
          <div style={{ background: 'var(--mantle)', border: '1px solid var(--surface0)', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface0)', color: 'var(--subtext0)', position: 'sticky', top: 0, background: 'var(--crust)' }}>
                  <th style={{ padding: '10px' }}>Time</th>
                  <th style={{ padding: '10px' }}>Action</th>
                  <th style={{ padding: '10px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--surface0)' }}>
                    <td style={{ padding: '10px', color: 'var(--subtext1)', whiteSpace: 'nowrap' }}>{new Date(l.created_at).toLocaleString()}</td>
                    <td style={{ padding: '10px', color: 'var(--teal)' }}>{l.action}</td>
                    <td style={{ padding: '10px', color: 'var(--text)' }}>{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

    </div>
  );
}
