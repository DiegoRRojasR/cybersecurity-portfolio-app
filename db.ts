import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

export async function setupDB() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      desc TEXT,
      icon TEXT,
      tags TEXT,
      link TEXT,
      image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS certs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      issuer TEXT,
      date TEXT,
      color TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      phone TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'unread'
    );
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT,
      organization TEXT,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      location TEXT
    );
  `);

  // Migrations for existing tables
  const projCols = await db.all("PRAGMA table_info(projects)");
  if (!projCols.some(c => c.name === 'image_url')) {
    await db.exec("ALTER TABLE projects ADD COLUMN image_url TEXT");
  }

  const msgCols = await db.all("PRAGMA table_info(messages)");
  if (!msgCols.some(c => c.name === 'status')) {
    await db.exec("ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'unread'");
  }

  // Seed admin user
  const admin = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!admin) {
    const hash = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hash]);
  }

  // Seed initial experiences if empty
  const expCount = await db.get('SELECT COUNT(*) as count FROM experiences');
  if (expCount.count === 0) {
    await db.run(
      'INSERT INTO experiences (role, organization, description, start_date, end_date, location) VALUES (?, ?, ?, ?, ?, ?)',
      [
        'SOC Analyst Intern',
        'C5i — Command, Control, Communications, Computers, Cybersecurity, and Intelligence Center of the Armed Forces',
        'Gained hands-on experience in a Security Operations Center (SOC) environment, supporting security monitoring, alert triage, and event analysis. Worked with Splunk Cloud to review logs, correlate events, and investigate anomalies, building practical experience in SIEM-based monitoring, threat visibility, and defensive cybersecurity operations.',
        'Internship',
        '',
        ''
      ]
    );
  }

  // Seed initial projects if empty
  const projCount = await db.get('SELECT COUNT(*) as count FROM projects');
  if (projCount.count === 0) {
    const initialProjects = [
      { title: 'FortiGate Client-to-Site VPN', desc: 'Implemented a client-to-site VPN using FortiGate, focusing on secure remote connectivity, firewall-based access control, and practical VPN deployment for enterprise remote access security.', icon: '[VPN]', tags: 'FortiGate,VPN,Firewall', link: 'https://github.com/DiegoRRojasR/VPN-Client-to-Site-Fortigate' },
      { title: 'FortiGate Site-to-Site VPN', desc: 'Configured a site-to-site VPN with FortiGate to securely connect separate network environments with encrypted communication and secure inter-network connectivity.', icon: '[S2S]', tags: 'FortiGate,Site-to-Site,Encryption', link: 'https://github.com/DiegoRRojasR/VPN-Site-to-Site-Fortigate' },
      { title: 'IPsec VPN with IKEv2', desc: 'Built a route-based site-to-site VPN using IPsec and IKEv2, developing practical knowledge of secure tunneling, VPN negotiation, and modern encrypted communication between networks.', icon: '[ENC]', tags: 'IPsec,IKEv2,Route-Based', link: 'https://github.com/DiegoRRojasR/Implementaci-n-de-VPN-Site-to-Site-Route-Based-VTI-con-IPsec-IKEv2' },
      { title: 'IPsec VPN with IKEv1', desc: 'Built a policy-based IPsec VPN using IKEv1, gaining experience with traditional VPN architecture and core concepts of protected network communication.', icon: '[PSK]', tags: 'IPsec,IKEv1,Policy-Based', link: 'https://github.com/DiegoRRojasR/Implementaci-n-de-una-VPN-Site-to-Site-IPsec-basada-en-pol-ticas-utilizando-IKEv1' },
      { title: 'DMVPN Labs (Phase 2 & 3)', desc: 'Developed labs involving DMVPN Phase 2 and Phase 3 to explore scalable VPN design, dynamic routing, and secure multi-site connectivity in enterprise-like environments.', icon: '[NET]', tags: 'DMVPN,Phase 2 & 3,Enterprise', link: 'https://github.com/DiegoRRojasR/-DMVPN-Fase-2-con-IKEv1-con-enrutamiento-din-mico' },
      { title: 'L2TP Linux VPN', desc: 'Implemented an L2TP VPN client setup on Linux, improving practical Linux networking skills and understanding of VPN configuration in real systems.', icon: '[TUX]', tags: 'Linux,L2TP,Networking', link: 'https://github.com/DiegoRRojasR/L2TP-Cliente-L2TP-Linux' },
      { title: 'Network Attack & Defense Labs', desc: 'Hands-on network security labs exploring both offensive and defensive perspectives across multiple attack vectors. Each lab was built to understand the exploit mechanics and then apply proper mitigations.', icon: '[ATK]', tags: 'VTP Attacks,DTP / VLAN Hopping,DNS Spoofing,MITM ARP,DHCP Spoofing,DHCP Starvation,STP Root Bridge', link: 'https://github.com/DiegoRRojasR?tab=repositories' }
    ];
    for (const p of initialProjects) {
      await db.run('INSERT INTO projects (title, desc, icon, tags, link) VALUES (?, ?, ?, ?, ?)', [p.title, p.desc, p.icon, p.tags, p.link]);
    }
  }

  // Seed initial certs if empty
  const certCount = await db.get('SELECT COUNT(*) as count FROM certs');
  if (certCount.count === 0) {
    const initialCerts = [
      { name: 'Fortinet Certified Fundamentals in Cybersecurity', issuer: 'Fortinet · Valid until Aug 21, 2027', date: 'Aug 21, 2025', color: 'var(--green)' },
      { name: 'CCNA: Switching, Routing, and Wireless Essentials', issuer: 'Cisco Networking Academy · ITLA', date: 'Sep 11, 2025', color: 'var(--blue)' },
      { name: 'Ethical Hacker', issuer: 'Cisco Networking Academy · ITLA', date: 'Dec 18, 2025', color: 'var(--red)' },
      { name: 'FCF – Getting Started in Cybersecurity 3.0', issuer: 'Fortinet', date: 'Aug 20, 2025', color: 'var(--peach)' },
      { name: 'FCF – Introduction to the Threat Landscape 3.0', issuer: 'Fortinet', date: 'Aug 20, 2025', color: 'var(--yellow)' },
      { name: 'Introduction to Linux', issuer: 'Linux FoundationX · UPValenciaX', date: '—', color: 'var(--teal)' }
    ];
    for (const c of initialCerts) {
      await db.run('INSERT INTO certs (name, issuer, date, color) VALUES (?, ?, ?, ?)', [c.name, c.issuer, c.date, c.color]);
    }
  }

  return db;
}
