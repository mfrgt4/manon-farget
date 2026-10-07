import { FormEvent, useEffect, useRef, useState } from "react";
import WordSphere from "./WordSphere";
import ProjectModal from "./ProjectModal";
import { categories, nav, profile, projects, skills, studies, tools } from "./data";

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
      if (c.classList.contains("proj") && matchMedia("(hover:hover)").matches) {
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      }
    };
    const onLeave = (e: PointerEvent) => {
      const c = e.target as HTMLElement;
      if (c.classList?.contains("proj")) c.style.transform = "";
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

const ids = nav.map(([id]) => id) as string[];
const delay = (d: number) => ({ "--d": d + "s" } as React.CSSProperties);

export default function App() {
  const typed = useTyped(profile.roles);
  const active = useActive(ids);
  const [open, setOpen] = useState<number | null>(null);
  const [cat, setCat] = useState<string>("all");
  const shown = cat === "all" ? projects : projects.filter((p) => p.category === cat);
  useEffects();

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = encodeURIComponent("Contact portfolio — " + f.get("name"));
    const body = encodeURIComponent(f.get("message") + "\n\n" + f.get("email"));
    location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <div id="glow" />
      <nav><div className="in">
        {nav.map(([id, label]) => <a key={id} href={"#" + id} className={active === id ? "on" : ""}>{label}</a>)}
      </div></nav>

      <section id="accueil">
        <div id="hero">
          <span className="badge mono rv"><span className="dot" />Disponible · stage avril 2027</span>
          <h1 className="rv" style={delay(0.1)}>Salut, moi c'est<br /><span className="grad">{profile.name}.</span></h1>
          <p className="lead mono rv" style={delay(0.2)}>{typed}<span className="cur" /></p>
          <p className="lead rv" style={{ ...delay(0.3), marginTop: 14 }}>
            Étudiante en 2<sup>e</sup> année de BUT MMI à l'Université Clermont Auvergne (Le Puy-en-Velay). Je conçois des interfaces qui allient code propre, design soigné et animations qui donnent envie de rester.
          </p>
          <div className="btns rv" style={delay(0.4)}>
            <a className="btn p" href="#projets">Voir mes projets →</a><a className="btn" href="#contact">Me contacter</a>
          </div>
        </div>
      </section>

      <section id="a-propos">
        <div className="about">
          {/* Texte de présentation à gauche */}
          <div className="rv rv-l" style={delay(0.15)}>
            <p className="tag mono">// à propos</p>
            <h2>Un peu plus sur moi.</h2>
            <p className="about-p">
              Je m'appelle Manon et je suis étudiante en 2<sup>e</sup> année de BUT MMI à l'Université Clermont Auvergne, au Puy-en-Velay.
            </p>
            <p className="about-p">
              J'aime autant coder une interface que la dessiner ou lui donner vie avec du mouvement : développement web, UI/UX design et motion design sont mes terrains de jeu.
            </p>
            <p className="about-p">
              Je cherche un stage à partir d'avril 2027 pour progresser au sein d'une équipe, et y apporter ma curiosité et mon sens du détail.
            </p>
            <div className="chips about-facts">
              <i className="mono">📍 Le Puy-en-Velay</i>
              <i className="mono">🎓 BUT MMI · 2e année</i>
              <i className="mono">🗓️ Stage avril 2027</i>
            </div>
            <div className="stats">
              {[[2, "année de BUT"], [projects.length, "projets"], [tools.length, "outils"]].map(([n, l]) => (
                <div key={l as string}><b className="mono"><Count to={n as number} /></b><span>{l}</span></div>
              ))}
            </div>
          </div>

          {/* Photo de profil à droite */}
          <div className="photo rv rv-r">
            {profile.photo ? (
              <img src={profile.photo} alt={`Portrait de ${profile.name}`} />
            ) : (
              <div className="photo-ph mono">
                <span>{profile.name.split(" ").map((w) => w[0]).join("")}</span>
                <small>ta photo ici</small>
              </div>
            )}
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