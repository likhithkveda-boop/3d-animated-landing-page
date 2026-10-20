import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Menu, X, MoveUpRight, Sparkles } from 'lucide-react';
import './style.css';

function OrbScene() {
  const mountRef = useRef(null);
  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;
    let renderer, scene, camera, orb, frame, resizeObserver;
    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(42, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 100);
      camera.position.z = 5.3;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(host.clientWidth, host.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      const geometry = new THREE.IcosahedronGeometry(1.25, 5);
      const positions = geometry.attributes.position;
      const original = positions.array.slice();
      for (let i = 0; i < positions.count; i++) {
        const x = original[i * 3], y = original[i * 3 + 1], z = original[i * 3 + 2];
        const wobble = 1 + 0.055 * Math.sin(x * 5.4 + y * 3.2) * Math.cos(z * 4.5 - y * 2.1);
        positions.setXYZ(i, x * wobble, y * wobble, z * wobble);
      }
      geometry.computeVertexNormals();
      const material = new THREE.MeshPhysicalMaterial({ color: 0x8c68ff, metalness: 0.42, roughness: 0.19, transmission: 0.12, thickness: 0.8, clearcoat: 1, clearcoatRoughness: 0.12, emissive: 0x24105e, emissiveIntensity: 0.55 });
      orb = new THREE.Mesh(geometry, material);
      scene.add(orb);
      const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.29, 2), new THREE.MeshBasicMaterial({ color: 0xc4b5fd, wireframe: true, transparent: true, opacity: 0.12 }));
      orb.add(wire);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x8b7cff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.008, 8, 180), ringMat);
      ring.rotation.set(1.05, 0.2, -0.3); orb.add(ring);
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.004, 8, 180), new THREE.MeshBasicMaterial({ color: 0x4de8d2, transparent: true, opacity: 0.32, side: THREE.DoubleSide }));
      ring2.rotation.set(0.25, 1.12, 0.5); orb.add(ring2);
      scene.add(new THREE.AmbientLight(0xb7a6ff, 1.65));
      const key = new THREE.PointLight(0x8b5cf6, 42, 12); key.position.set(2.5, 2, 3); scene.add(key);
      const cyan = new THREE.PointLight(0x43f5df, 25, 10); cyan.position.set(-2.5, -1, 2); scene.add(cyan);
      const starGeo = new THREE.BufferGeometry(); const count = 850; const stars = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) { stars[i*3] = (Math.random() - .5) * 11; stars[i*3+1] = (Math.random() - .5) * 8; stars[i*3+2] = (Math.random() - .5) * 5 - 1; }
      starGeo.setAttribute('position', new THREE.BufferAttribute(stars, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xbab3ff, size: 0.012, transparent: true, opacity: 0.8 })));
      let mx = 0, my = 0;
      const onMove = (e) => { const r = host.getBoundingClientRect(); mx = ((e.clientX-r.left)/r.width-.5)*.35; my = ((e.clientY-r.top)/r.height-.5)*.25; };
      host.addEventListener('pointermove', onMove);
      const clock = new THREE.Clock();
      const animate = () => { frame = requestAnimationFrame(animate); const t = clock.getElapsedTime(); orb.rotation.y = t * .12 + mx; orb.rotation.x = Math.sin(t * .23) * .12 + my; orb.position.y = Math.sin(t * .55) * .08; renderer.render(scene, camera); };
      animate();
      resizeObserver = new ResizeObserver(() => { if (!host.clientWidth) return; camera.aspect = host.clientWidth / Math.max(host.clientHeight, 1); camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth, host.clientHeight); });
      resizeObserver.observe(host);
      return () => { cancelAnimationFrame(frame); resizeObserver?.disconnect(); host.removeEventListener('pointermove', onMove); renderer.dispose(); geometry.dispose(); material.dispose(); if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement); };
    } catch (e) { console.warn('3D scene could not initialize', e); }
    return () => { if (frame) cancelAnimationFrame(frame); resizeObserver?.disconnect(); if (renderer) { renderer.dispose(); if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement); } };
  }, []);
  return <div className="orb-scene" ref={mountRef} aria-label="Interactive animated 3D orb" />;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 24); window.addEventListener('scroll', onScroll); const nodes = document.querySelectorAll('.reveal'); const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.15 }); nodes.forEach(n => observer.observe(n)); return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); }; }, []);
  const closeMenu = () => setMenuOpen(false);
  return <div className="site-shell">
    <div className="noise" aria-hidden="true" />
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <a className="brand" href="#home" onClick={closeMenu}><span className="brand-mark"><span /></span>ORBIT<span className="brand-dot">®</span></a>
      <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
        <a href="#vision" onClick={closeMenu}>Vision</a><a href="#capabilities" onClick={closeMenu}>Capabilities</a><a href="#contact" onClick={closeMenu}>Contact</a>
      </nav>
      <a className="nav-cta" href="#contact">Let’s talk <ArrowUpRight size={15}/></a>
      <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>

    <main>
      <section className="hero" id="home">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot"/> INDEPENDENT DIGITAL STUDIO <span className="eyebrow-line"/></div>
          <h1>Make room<br/>for <span className="gradient-text">wonder.</span></h1>
          <p className="hero-description">We turn ambitious ideas into extraordinary digital experiences. A little unexpected. Entirely unforgettable.</p>
          <div className="hero-actions"><a className="button-primary" href="#vision">Explore the universe <ArrowRight size={17}/></a><a className="text-link" href="#capabilities">Discover our approach <ArrowDownRight size={16}/></a></div>
          <div className="hero-footnote"><span>01 / 03</span><span className="footnote-line"/><span>DESIGN WITHOUT GRAVITY</span></div>
        </div>
        <div className="hero-art"><div className="art-glow"/><div className="orb-label label-top"><span className="label-dot"/> FIG. 001 — ORIGIN</div><OrbScene/><div className="orbit-caption"><span className="caption-line"/><div><strong>Beyond the ordinary</strong><small>A new dimension of digital</small></div></div><div className="coordinate coord-one">35° 41' 22.2" N<br/>139° 41' 30.1" E</div><div className="coordinate coord-two">CORE SYSTEM<br/><span>ONLINE · 100%</span></div></div>
        <a href="#vision" className="scroll-cue"><span className="scroll-wheel"/> SCROLL TO EXPLORE</a>
        <div className="hero-side-note">IMAGINATION, IN MOTION — EST. 2025</div>
      </section>

      <section className="ticker" aria-label="Our philosophy"><div className="ticker-track">{Array.from({length:2},(_,i)=><div className="ticker-group" key={i}><span>THINK BEYOND</span><Sparkles/><span>CREATE FEARLESSLY</span><Sparkles/><span>BUILD THE UNEXPECTED</span><Sparkles/><span>STAY CURIOUS</span><Sparkles/></div>)}</div></section>

      <section className="vision section-pad" id="vision"><div className="section-kicker reveal"><span>01 — THE VISION</span><span>LESS ORDINARY. MORE EXTRAORDINARY.</span></div><div className="vision-layout"><h2 className="reveal">The future isn’t<br/>found. It’s <span className="gradient-text">made.</span></h2><div className="vision-copy reveal"><p>We believe the best digital experiences don’t just look different. They make you <em>feel</em> something different.</p><p>We blend strategy, design, and technology to create moments that stop the scroll and stay in your mind.</p><a className="round-link" href="#contact" aria-label="Talk to our studio"><ArrowUpRight/></a></div></div><div className="stat-row reveal"><div><strong>01<span>+</span></strong><small>Curiosity, always</small></div><div><strong>∞</strong><small>Ways to imagine</small></div><div><strong>100<span>%</span></strong><small>Made with intention</small></div></div></section>

      <section className="capabilities section-pad" id="capabilities"><div className="section-kicker reveal"><span>02 — WHAT WE DO</span><span>SMALL DETAILS. BIG FEELINGS.</span></div><div className="cap-heading reveal"><h2>Designed to<br/><span className="muted-text">move you.</span></h2><p>Every pixel has a purpose.<br/>Every interaction, a little magic.</p></div><div className="cap-grid">
        <article className="cap-card card-violet reveal"><div className="card-number">01 / EXPERIENCE</div><div className="mini-orb mini-orb-violet"/><h3>Digital worlds</h3><p>Immersive websites and interactive stories that make the impossible feel one click away.</p><a href="#contact" aria-label="Ask about digital worlds"><ArrowUpRight/></a></article>
        <article className="cap-card card-cyan reveal"><div className="card-number">02 / IDENTITY</div><div className="mini-orb mini-orb-cyan"/><h3>Bold identities</h3><p>Distinctive visual systems that give ambitious brands a world of their own.</p><a href="#contact" aria-label="Ask about bold identities"><ArrowUpRight/></a></article>
        <article className="cap-card card-pink reveal"><div className="card-number">03 / MOTION</div><div className="mini-orb mini-orb-pink"/><h3>Living motion</h3><p>Fluid, thoughtful animation that transforms ordinary moments into something memorable.</p><a href="#contact" aria-label="Ask about living motion"><ArrowUpRight/></a></article>
      </div></section>

      <section className="manifesto"><div className="manifesto-orb"/><div className="manifesto-content reveal"><span className="section-kicker">03 — A LITTLE REMINDER</span><h2>Safe is easy.<br/><span className="gradient-text">Extraordinary</span><br/>takes imagination.</h2><p>Let’s make something that feels like the beginning of something big.</p><a className="button-primary" href="#contact">Make it happen <ArrowUpRight size={17}/></a></div><span className="manifesto-index">O / ∞</span></section>

      <section className="contact section-pad" id="contact"><div className="section-kicker reveal"><span>04 — YOUR MOVE</span><span>GOOD THINGS START SOMEWHERE.</span></div><div className="contact-layout"><h2 className="reveal">Have a good<br/>kind of <span className="gradient-text">crazy?</span></h2><div className="contact-copy reveal"><p>Tell us what you’re dreaming up. The ambitious stuff, the half-formed ideas, the “what if” conversations. We’re here for it.</p><a className="contact-link" href="mailto:hello@orbit.studio">hello@orbit.studio <MoveUpRight size={20}/></a><span className="availability"><span className="live-dot"/> OPEN FOR SELECT PROJECTS</span></div></div></section>
    </main>
    <footer className="footer"><a className="brand" href="#home"><span className="brand-mark"><span/></span>ORBIT<span className="brand-dot">®</span></a><span>© 2025 ORBIT STUDIO. MADE OF POSSIBILITY.</span><a href="#home" className="back-top">BACK TO TOP ↑</a></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
