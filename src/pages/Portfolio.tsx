import React, { useEffect, useState, useRef } from 'react';

const bootLines = [
  { t: 'dim',  tx: 'GNU GRUB  version 2.12' },
  { t: 'dim',  tx: '' },
  { t: 'info', tx: '[    0.000000] Linux version 6.8.0-1018-generic' },
  { t: 'info', tx: '[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.8.0 root=/dev/sda1 ro quiet splash' },
  { t: 'ok',   tx: '[    0.124591] BIOS-provided physical RAM map:' },
  { t: 'ok',   tx: '[    0.203021] ACPI: LAPIC (acpi_id[0x00] lapic_id[0x00] enabled)' },
  { t: 'dim',  tx: '[    0.412843] PCI: Using configuration type 1 for base access' },
  { t: 'ok',   tx: '[    0.512001] NET: Registered PF_INET6 protocol family' },
  { t: 'ok',   tx: '[    0.612441] clocksource: tsc-early: mask: 0xffffffffffffffff' },
  { t: 'info', tx: '[    0.720112] Loading essential modules...' },
  { t: 'ok',   tx: '[    0.821349] cryptd: multi-threaded crypto daemon' },
  { t: 'ok',   tx: '[    0.921553] iptables: loaded (policy DROP)' },
  { t: 'warn', tx: '[    1.021013] Warning: SELINUX not enforcing — using AppArmor' },
  { t: 'ok',   tx: '[    1.121881] ipsec: Pluto 3.0 started' },
  { t: 'ok',   tx: '[    1.231002] VPN subsystem initialized' },
  { t: 'ok',   tx: '[    1.341115] FortiGate policy engine: active' },
  { t: 'ok',   tx: '[    1.451009] DMVPN tunnel: Phase 3 negotiation complete' },
  { t: 'ok',   tx: '[    1.561402] eth0: link UP (1000Mbps full-duplex)' },
  { t: 'ok',   tx: '[    1.671500] Firewall rules loaded — 42 policies active' },
  { t: 'ok',   tx: '[    1.781200] IDS/IPS engine: monitoring 0.0.0.0/0' },
  { t: 'dim',  tx: '' },
  { t: 'green',tx: 'Starting diego-portfolio.service ...' },
  { t: 'ok',   tx: '[  OK  ] Reached target Portfolio Online.' },
  { t: 'dim',  tx: '' },
  { t: 'info', tx: 'Welcome. Type "help" or browse sections above.' },
];

export default function Portfolio() {
  const [booting, setBooting] = useState(true);
  const [bootLog, setBootLog] = useState<{t: string, tx: string, delay: number}[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('/api/experiences').then(r => r.json()).then(setExperiences);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
    fetch('/api/certs').then(r => r.json()).then(setCerts);
  }, []);

  useEffect(() => {
    let delay = 0;
    const logEntries: {t: string, tx: string, delay: number}[] = [];
    
    bootLines.forEach(l => {
      delay += Math.random() * 60 + 20;
      logEntries.push({ ...l, delay });
    });
    
    setBootLog(logEntries);

    const timer = setTimeout(() => {
      setBooting(false);
    }, delay + 900);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (booting) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [booting, projects, certs, experiences]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, message })
      });
      if (res.ok) {
        setStatus('Message sent successfully!');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        setStatus('Failed to send message.');
      }
    } catch (err) {
      setStatus('Error sending message.');
    }
  };

  return (
    <>
      {booting && (
        <div id="boot" className={booting ? '' : 'fade-out'}>
          <div id="boot-log" ref={logRef}>
            {bootLog.map((l, i) => (
              <span 
                key={i} 
                className={`line ${l.t}`} 
                style={{ animationDelay: `${l.delay}ms` }}
              >
                {l.tx}
              </span>
            ))}
          </div>
        </div>
      )}

      <nav>
        <div className="nav-logo">diego<span>@</span>rojas<span>:~$</span></div>
        <ul className="nav-links">
          <li><a href="#about">about</a></li>
          <li><a href="#experience">experience</a></li>
          <li><a href="#skills">skills</a></li>
          <li><a href="#certs">certs</a></li>
          <li><a href="#projects">projects</a></li>
          <li><a href="#contact">contact</a></li>
        </ul>
      </nav>

      <main>
        <section id="hero">
          <div className="hero-grid"></div>
          <div className="achievement-badge">
            <div>
              <span className="badge-label">1st Place</span>
              &nbsp;· AI Cyber Defense Competition — Hackcon 2026
            </div>
          </div>
          <div className="prompt-line">
            <span className="host">diego@rojas</span><span>:</span><span className="path">~/portfolio</span><span className="sym">$</span>
            <span style={{ color: 'var(--overlay0)' }}>whoami</span>
          </div>
          <h1 className="hero-name glitch" data-text="Diego Rojas">
            <span className="first">Diego </span><span className="last">Rojas</span>
          </h1>
          <p className="hero-title">Cybersecurity Enthusiast · Network Security · Red &amp; Blue Team</p>
          <p className="hero-desc">
            Hands-on practitioner focused on network security, VPN implementation, Linux, ethical hacking,
            and practical attack-and-defense labs. Passionate about understanding how systems work,
            how they can be exploited, and how they can be secured.
          </p>
          <div className="hero-links">
            <a className="btn btn-primary" href="https://github.com/DiegoRRojasR" target="_blank" rel="noreferrer" title="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a className="btn btn-secondary" href="https://www.linkedin.com/in/diegorafaelrojasreyes/" target="_blank" rel="noreferrer" title="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a className="btn btn-secondary" href="#contact" style={{ borderColor: 'var(--blue)', color: 'var(--blue)' }} title="Contact">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
          </div>
        </section>

        <section id="about">
          <div className="sec-header reveal">
            <span className="sec-num">01.</span>
            <h2 className="sec-title">About Me</h2>
            <div className="sec-line"></div>
          </div>
          <div id="about-content">
            <div className="about-text reveal">
              <p>
                I'm a cybersecurity student at <strong>ITLA</strong> focused on network security,
                red team, blue team, and secure infrastructure. My journey has been shaped by
                hands-on practice, technical labs, certifications, and real-world learning
                experiences.
              </p>
              <p>
                My background covers <strong>networking</strong>, VPN technologies, Linux,
                ethical hacking, and cybersecurity fundamentals. I enjoy working on practical
                environments where I can configure, test, troubleshoot, and improve secure
                network infrastructures.
              </p>
              <p>
                One of my biggest highlights so far was competing in
                <strong>Hackcon 2026</strong>, where my team earned
                <strong>1st Place in the AI Cyber Defense</strong> competition — an experience
                that reinforced my passion for cybersecurity and the power of collaborative
                technical problem-solving.
              </p>
            </div>
            <div className="about-meta reveal">
              <div className="meta-item">
                <span className="meta-key">location</span>
                <span className="meta-val">Santo Domingo, DR</span>
              </div>
              <div className="meta-item">
                <span className="meta-key">institution</span>
                <span className="meta-val">ITLA — Instituto Tecnológico de las Américas</span>
              </div>
              <div className="meta-item">
                <span className="meta-key">focus</span>
                <span className="meta-val">Network Security · Red Team · Blue Team</span>
              </div>
              <div className="meta-item">
                <span className="meta-key">github</span>
                <span className="meta-val"><a href="https://github.com/DiegoRRojasR" target="_blank" rel="noreferrer">github.com/DiegoRRojasR</a></span>
              </div>
              <div className="meta-item">
                <span className="meta-key">linkedin</span>
                <span className="meta-val"><a href="https://www.linkedin.com/in/diegorafaelrojasreyes/" target="_blank" rel="noreferrer">diegorafaelrojasreyes</a></span>
              </div>
              <div className="meta-item">
                <span className="meta-key">status</span>
                <span className="meta-val" style={{ color: 'var(--green)' }}>● Open to opportunities</span>
              </div>
            </div>
          </div>
        </section>

        <section id="experience">
          <div className="sec-header reveal">
            <span className="sec-num">02.</span>
            <h2 className="sec-title">Experience</h2>
            <div className="sec-line"></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {experiences.map(exp => (
              <div key={exp.id} className="experience-content reveal" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', background: 'var(--mantle)', border: '1px solid var(--surface0)', borderRadius: '8px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ color: 'var(--text)', fontSize: '1.2rem', marginBottom: '5px' }}>{exp.role}</h3>
                    <h4 style={{ color: 'var(--blue)', fontSize: '1rem', marginBottom: '15px' }}>{exp.organization}</h4>
                  </div>
                  <div style={{ color: 'var(--subtext0)', fontSize: '0.9rem', textAlign: 'right' }}>
                    <div>{exp.start_date} {exp.end_date ? `- ${exp.end_date}` : ''}</div>
                    {exp.location && <div>{exp.location}</div>}
                  </div>
                </div>
                <p style={{ color: 'var(--subtext0)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="skills">
          <div className="sec-header reveal">
            <span className="sec-num">03.</span>
            <h2 className="sec-title">Skills</h2>
            <div className="sec-line"></div>
          </div>
          <div className="skills-grid">
            <div className="skill-group cyber reveal">
              <div className="skill-group-title">cybersecurity</div>
              <div className="skill-tags">
                <span className="tag">Ethical Hacking</span>
                <span className="tag">Red Team</span>
                <span className="tag">Blue Team</span>
                <span className="tag">Vulnerability Analysis</span>
                <span className="tag">Threat Landscape</span>
                <span className="tag">Security Hardening</span>
                <span className="tag">Attack &amp; Defense Labs</span>
              </div>
            </div>
            <div className="skill-group net reveal">
              <div className="skill-group-title">networking</div>
              <div className="skill-tags">
                <span className="tag">Switching &amp; Routing</span>
                <span className="tag">VPN Technologies</span>
                <span className="tag">IPsec</span>
                <span className="tag">IKEv1 / IKEv2</span>
                <span className="tag">DMVPN</span>
                <span className="tag">L2TP</span>
                <span className="tag">FortiGate</span>
                <span className="tag">Wireless Networking</span>
                <span className="tag">Troubleshooting</span>
              </div>
            </div>
            <div className="skill-group sys reveal">
              <div className="skill-group-title">systems &amp; tools</div>
              <div className="skill-tags">
                <span className="tag">Linux</span>
                <span className="tag">Git &amp; GitHub</span>
                <span className="tag">Secure Infra Concepts</span>
                <span className="tag">Lab Environments</span>
                <span className="tag">Technical Docs</span>
              </div>
            </div>
            <div className="skill-group soft reveal">
              <div className="skill-group-title">professional</div>
              <div className="skill-tags">
                <span className="tag">Analytical Thinking</span>
                <span className="tag">Problem Solving</span>
                <span className="tag">Team Collaboration</span>
                <span className="tag">Adaptability</span>
                <span className="tag">Continuous Learning</span>
                <span className="tag">Attention to Detail</span>
              </div>
            </div>
          </div>
        </section>

        <section id="certs">
          <div className="sec-header reveal">
            <span className="sec-num">04.</span>
            <h2 className="sec-title">Certifications</h2>
            <div className="sec-line"></div>
          </div>
          <div className="certs-list">
            {certs.map(cert => (
              <div key={cert.id} className="cert-item reveal">
                <div className="cert-bar" style={{ background: cert.color }}></div>
                <div className="cert-body">
                  <div>
                    <div className="cert-name">{cert.name}</div>
                    <div className="cert-issuer">{cert.issuer}</div>
                  </div>
                  <div className="cert-date">{cert.date}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="projects">
          <div className="sec-header reveal">
            <span className="sec-num">05.</span>
            <h2 className="sec-title">Projects</h2>
            <div className="sec-line"></div>
          </div>
          <div className="projects-grid">
            {projects.map(p => (
              <a key={p.id} href={p.link} target="_blank" rel="noreferrer" className="project-card reveal">
                {p.image_url ? (
                  <div style={{ width: '100%', height: '150px', marginBottom: '15px', overflow: 'hidden', borderRadius: '4px' }}>
                    <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="project-icon">{p.icon}</div>
                )}
                <div className="project-title">{p.title}</div>
                <p className="project-desc">{p.desc}</p>
                <div className="project-tags">
                  {p.tags.split(',').map((t: string) => {
                    let tagClass = '';
                    if (t.toLowerCase().includes('vpn')) tagClass = 'ptag-vpn';
                    else if (t.toLowerCase().includes('fortigate')) tagClass = 'ptag-forti';
                    else if (t.toLowerCase().includes('ipsec')) tagClass = 'ptag-ipsec';
                    else if (t.toLowerCase().includes('linux')) tagClass = 'ptag-linux';
                    else if (t.toLowerCase().includes('attack')) tagClass = 'ptag-atk';
                    else tagClass = 'ptag-vpn';
                    return <span key={t} className={`ptag ${tagClass}`}>{t.trim()}</span>;
                  })}
                </div>
              </a>
            ))}
          </div>
        </section>

        <section id="contact">
          <div className="sec-header reveal">
            <span className="sec-num">06.</span>
            <h2 className="sec-title">Contact</h2>
            <div className="sec-line"></div>
          </div>
          <div className="contact-grid">
            <div className="contact-text reveal">
              <h3>Let's <span>connect</span>.</h3>
              <p>
                I'm currently looking for opportunities in cybersecurity —
                whether it's defensive security, network protection, infrastructure hardening,
                or security operations. Feel free to reach out via email or LinkedIn, or explore my
                work on GitHub.
              </p>
              <form onSubmit={handleContactSubmit} style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ padding: '12px', background: 'var(--mantle)', border: '1px solid var(--surface0)', color: 'var(--text)', fontFamily: 'inherit' }}
                />
                <input 
                  type="text" 
                  placeholder="Your Phone (Optional)" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ padding: '12px', background: 'var(--mantle)', border: '1px solid var(--surface0)', color: 'var(--text)', fontFamily: 'inherit' }}
                />
                <textarea 
                  placeholder="Your Message" 
                  required 
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{ padding: '12px', background: 'var(--mantle)', border: '1px solid var(--surface0)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
                ></textarea>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Send Message</button>
                {status && <span style={{ color: 'var(--green)', fontSize: '12px' }}>{status}</span>}
              </form>
            </div>
            <div className="contact-links reveal">
              <a className="contact-link" href="mailto:diegorojastech404@gmail.com">
                <span className="contact-link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.629.364-1.175.891-1.45L12 11.73l11.109-7.723c.527.275.891.821.891 1.45z"/><path d="M12 9.109L.473 1.636h23.054z" opacity=".3"/></svg>
                </span>
                <div>
                  <div className="contact-link-label">EMAIL</div>
                  <div className="contact-link-val">diegorojastech404@gmail.com</div>
                </div>
              </a>
              <a className="contact-link" href="tel:+18096609346">
                <span className="contact-link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l.46-.46a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
                </span>
                <div>
                  <div className="contact-link-label">PHONE</div>
                  <div className="contact-link-val">+1 (809) 660-9346</div>
                </div>
              </a>
              <a className="contact-link" href="https://github.com/DiegoRRojasR" target="_blank" rel="noreferrer">
                <span className="contact-link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                </span>
                <div>
                  <div className="contact-link-label">GITHUB</div>
                  <div className="contact-link-val">github.com/DiegoRRojasR</div>
                </div>
              </a>
              <a className="contact-link" href="https://www.linkedin.com/in/diegorafaelrojasreyes/" target="_blank" rel="noreferrer">
                <span className="contact-link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </span>
                <div>
                  <div className="contact-link-label">LINKEDIN</div>
                  <div className="contact-link-val">diegorafaelrojasreyes</div>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        built with ♥ by <span>diego rojas</span> · cybersecurity portfolio · 2026
      </footer>
    </>
  );
}
