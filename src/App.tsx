import { FormEvent, useEffect, useRef, useState } from "react";
import WordSphere from "./WordSphere";
import ProjectModal from "./ProjectModal";
import { about, categories, facts, nav, profile, projects, skills, studies, tools } from "./data";

function useTyped(words: string[]) {
  const [txt, setTxt] = useState("");
  useEffect(() => {
    let wi = 0, ci = 0, del = false, id = 0;
    const tick = () => {
      const w = words[wi];
      setTxt(w.slice(0, ci));
      let wait = del ? 40 : 90;
      if (!del && ci === w.length) { del = true; wait = 1400; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
      else ci += del ? -1 : 1;
      id = window.setTimeout(tick, wait);
    };
    tick();
    return () => clearTimeout(id);
  }, [words]);
  return txt;
}

function useEffects() {
  useEffect(() => {
    const rv = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll(".rv").forEach((el) => rv.observe(el));

    const glow = document.getElementById("glow")!;
    const onMove = (e: PointerEvent) => {
      glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px";
      const c = (e.target as HTMLElement).closest<HTMLElement>(".cell");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
      if ((c.classList.contains("proj") || c.classList.contains("skill")) && matchMedia("(hover:hover)").matches) {
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      }
    };
    const onLeave = (e: PointerEvent) => {
      const c = e.target as HTMLElement;
      if (c.classList?.contains("proj") || c.classList?.contains("skill")) c.style.transform = "";
    };
    addEventListener("pointermove", onMove);
    document.addEventListener("pointerout", onLeave);
    return () => { rv.disconnect(); removeEventListener("pointermove", onMove); document.removeEventListener("pointerout", onLeave); };
  }, []);
}

function useActive(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const so = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) so.observe(el); });
    return () => so.disconnect();
  }, [ids]);
  return active;
}

function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!; let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 1400);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>0</span>;
}

function Marquee({ list, rev }: { list: string[]; rev?: boolean }) {
  return (
    <div className={"marq" + (rev ? " rev" : "")} aria-hidden="true">
      <div className="marq-t">{[...list, ...list].map((t, i) => <span key={i}>{t} <b>✦</b></span>)}</div>
    </div>
  );
}

// Barre de progression, parallaxe, ligne de timeline, curseur personnalisé, boutons magnétiques
function useMotion() {
  useEffect(() => {
    const fine = matchMedia("(hover:hover) and (pointer:fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const prog = document.getElementById("progress")!;
    const tl = document.querySelector<HTMLElement>(".tl");
    let tick = false;
    const onScroll = () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => {
        tick = false;
        const max = root.scrollHeight - innerHeight;
        prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        root.style.setProperty("--sy", String(scrollY));
        if (tl) {
          const r = tl.getBoundingClientRect();
          tl.style.setProperty("--tl", String(Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / r.height))));
        }
      });
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    // Traînée d'étoiles qui suit le curseur
    const cv = document.getElementById("stars") as HTMLCanvasElement;
    const ctx = cv.getContext("2d")!;
    type P = { x: number; y: number; vx: number; vy: number; s: number; r: number; vr: number; life: number; max: number; c: string };
    let ps: P[] = [], raf = 0, running = false, lx = -999, ly = -999;
    const COL = ["#D13670", "#DF729B", "#f3f4f6", "#DF729B"];
    const size = () => { const d = Math.min(devicePixelRatio, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener("resize", size);
    const star = (p: P) => { // étoile à 4 branches
      const k = 1 - p.life / p.max, R = p.s * (0.4 + 0.6 * k), r = R * 0.28;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.globalAlpha = k; ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, d = i % 2 ? r : R; ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    };
    const frame = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps = ps.filter((p) => p.life < p.max);
      for (const p of ps) { p.life++; p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.vx *= 0.985; p.r += p.vr; star(p); }
      if (ps.length) raf = requestAnimationFrame(frame); else running = false;
    };
    const spawn = (x: number, y: number) => {
      ps.push({ x: x + (Math.random() - 0.5) * 8, y: y + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2 + 0.2,
        s: 6 + Math.random() * 9, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.08, life: 0, max: 38 + Math.random() * 30, c: COL[(Math.random() * COL.length) | 0] });
      if (ps.length > 100) ps.shift();
      if (!running) { running = true; raf = requestAnimationFrame(frame); }
    };
    const move = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - lx, e.clientY - ly) > 14) { spawn(e.clientX, e.clientY); lx = e.clientX; ly = e.clientY; }
      const b = (e.target as HTMLElement).closest?.<HTMLElement>(".btn");
      if (b) { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35 - 3}px)`; }
    };
    const out = (e: PointerEvent) => { const b = (e.target as HTMLElement).closest?.<HTMLElement>(".btn"); if (b) b.style.transform = ""; };
    if (fine) { root.classList.add("cur-on"); addEventListener("pointermove", move); document.addEventListener("pointerout", out); }
    return () => {
      removeEventListener("scroll", onScroll); removeEventListener("resize", size);
      removeEventListener("pointermove", move); document.removeEventListener("pointerout", out);
      cancelAnimationFrame(raf); root.classList.remove("cur-on");
    };
  }, []);
}

const ids = nav.map(([id]) => id) as string[];
const sections = ["accueil", ...ids]; // "accueil" = haut de page, sans lien dans le menu
const delay = (d: number) => ({ "--d": d + "s" } as React.CSSProperties);

export default function App() {
  const typed = useTyped(profile.roles);
  const active = useActive(sections);
  const [open, setOpen] = useState<number | null>(null);
  const [cat, setCat] = useState<string>("all");
  const shown = cat === "all" ? projects : projects.filter((p) => p.category === cat);
  useEffects();
  useMotion();

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = encodeURIComponent("Contact portfolio — " + f.get("name"));
    const body = encodeURIComponent(f.get("message") + "\n\n" + f.get("email"));
    location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <div id="progress" /><div className="orb o1" /><div className="orb o2" /><div className="orb o3" />
      <canvas id="stars" />
      <div id="glow" />
      <nav><div className="in">
        {nav.map(([id, label]) => <a key={id} href={"#" + id} className={active === id ? "on" : ""}>{label}</a>)}
      </div></nav>

      <section id="accueil">
        <div id="hero">
          <span className="badge mono rv"><span className="dot" />Disponible · stage avril 2027</span>
          <h1 className="rv" style={delay(0.1)}><span className="chars" aria-label="Hello ! Moi c'est,">{[..."Hello ! Moi c'est,"].map((c, i) => <span key={i} aria-hidden="true" style={{ "--i": i } as React.CSSProperties}>{c === " " ? "\u00a0" : c}</span>)}</span><br /><span className="grad">{profile.name}.</span></h1>
          <p className="lead mono rv" style={delay(0.2)}>{typed}<span className="cur" /></p>
          <p className="lead rv" style={{ ...delay(0.3), marginTop: 14 }}>
            Étudiante en 2<sup>e</sup> année de BUT MMI à l'Université Clermont Auvergne (Le Puy-en-Velay). Je conçois des interfaces qui allient code propre, design soigné et animations qui donnent envie de rester.
          </p>
          <div className="btns rv" style={delay(0.4)}>
            <a className="btn p" href="#projets">Voir mes projets →</a><a className="btn" href="#contact">Me contacter</a>
          </div>
          <a className="scroll mono" href="#a-propos">scroll ↓</a>
        </div>
      </section>

      <Marquee list={tools} />
      <Marquee list={[...tools].reverse()} rev />

      <section id="a-propos">
        <div className="about">
          <div className="photo rv rv-l">
            {profile.photo
              ? <img src={profile.photo} alt={`Portrait de ${profile.name}`} />
              : <div className="photo-ph mono"><span>{profile.name.split(" ").map((w) => w[0]).join("")}</span><small>ta photo ici</small></div>}
          </div>
          <div className="rv rv-r" style={delay(0.15)}>
            <p className="tag mono">// à propos</p>
            <h2>Un peu plus sur moi.</h2>
            {about.map((t) => <p key={t} className="about-p">{t}</p>)}
            <div className="chips about-facts">{facts.map((f) => <i key={f} className="mono">{f}</i>)}</div>
            <div className="stats">
              {[[2, "année de BUT"], [projects.length, "projets"], [tools.length, "outils"]].map(([n, l]) => (
                <div key={l as string}><b className="mono"><Count to={n as number} /></b><span>{l}</span></div>
              ))}
            </div>
          </div>
        </div>
        <p className="tag mono rv" style={{ marginTop: 70 }}>// 5 compétences clés</p>
        <h2 className="rv">Ce que je sais faire.</h2>
        <div className="bento">
          {skills.map((s, i) => (
            <div key={s.title} className={`cell skill ${s.span ?? ""} rv rv-z`} style={delay(i * 0.08)}>
              <span className="ico">{s.icon}</span><h3>{s.title}</h3><p className={i === 0 ? "big" : ""}>{s.text}</p>
            </div>
          ))}
          <div className="cell s2 rv" style={delay(0.4)}>
            <h3 className="mono" style={{ color: "var(--acc)" }}>&gt; objectif.txt</h3>
            <p className="mono">Stage dev web / intégration · avril 2027 · mobilité possible.</p>
          </div>
        </div>
      </section>

      <section id="boite-a-outils">
        <p className="tag mono rv">// stack</p>
        <h2 className="rv">Ma boîte à outils.</h2>
        <WordSphere words={tools} />
      </section>

      <section id="projets">
        <p className="tag mono rv">// work</p>
        <h2 className="rv">Projets.</h2>
        <div className="tabs rv" role="tablist">
          {categories.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={cat === id} className={cat === id ? "on" : ""} onClick={() => setCat(id)}>
              {label} <span className="mono">({id === "all" ? projects.length : projects.filter((p) => p.category === id).length})</span>
            </button>
          ))}
        </div>
        <div className="grid3" key={cat}>
          {shown.map((p, i) => (
            <a key={p.title} href={p.href} className="cell proj pop" style={delay((i % 3) * 0.08)} onClick={(e) => { e.preventDefault(); setOpen(i); }}>
              <span className="arrow">↗</span>
              <div className="thumb" style={{ "--c": p.color } as React.CSSProperties}>{p.icon}</div>
              <span className="when mono">{p.kind}</span><h3>{p.title}</h3><p>{p.text}</p>
              <div className="chips">{p.stack.map((c) => <i key={c} className="mono">{c}</i>)}</div>
            </a>
          ))}
        </div>
      </section>

      <section id="parcours">
        <p className="tag mono rv">// timeline</p>
        <h2 className="rv">Parcours.</h2>
        <div className="tl">
          {studies.map((s, i) => (
            <div key={s.title} className="cell it rv" style={delay(i * 0.08)}>
              <span className="when mono">{s.when}</span>
              <h3 style={s.accent ? { color: "var(--acc)" } : undefined}>{s.title}</h3><p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact">
        <p className="tag mono rv">// contact</p>
        <h2 className="rv">Travaillons ensemble.</h2>
        <div className="bento">
          <div className="cell s2 rv">
            <form onSubmit={send}>
              <input name="name" placeholder="Ton nom" required />
              <input name="email" type="email" placeholder="Ton email" required />
              <textarea name="message" rows={4} placeholder="Ton message" required />
              <button className="btn p" type="submit">Envoyer ↗</button>
            </form>
          </div>
          <div className="cell s2 rv" style={delay(0.1)}>
            <div className="links">
              <a href={"mailto:" + profile.email}><span>Email</span><span className="mono">{profile.email}</span></a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><span>LinkedIn</span><span>↗</span></a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer"><span>GitHub</span><span>↗</span></a>
              <a href={profile.cv} target="_blank" rel="noopener noreferrer"><span>CV (PDF)</span><span>↓</span></a>
            </div>
          </div>
        </div>
      </section>
      {open !== null && <ProjectModal list={shown} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
      <footer className="mono">© 2026 {profile.name} · Fait avec React, three.js et Vercel · <a href="#accueil" style={{ color: "var(--acc)" }}>↑ haut</a></footer>
    </>
  );
}
