import { FormEvent, useEffect, useRef, useState } from "react";
import WordSphere from "./WordSphere";
import ProjectModal from "./ProjectModal";
import { categories, nav, profile, projects, skills, studies, tools } from "./data";
import Particles from "./Particles";

function useTyped(words: string[]) {
  const [txt, setTxt] = useState("");

  useEffect(() => {
    let wi = 0, ci = 0, del = false, id = 0;

    const tick = () => {
      const w = words[wi];
      setTxt(w.slice(0, ci));

      let wait = del ? 40 : 90;

      if (!del && ci === w.length) {
        del = true;
        wait = 1400;
      } else if (del && ci === 0) {
        del = false;
        wi = (wi + 1) % words.length;
      } else {
        ci += del ? -1 : 1;
      }

      id = window.setTimeout(tick, wait);
    };

    tick();
    return () => clearTimeout(id);
  }, [words]);

  return txt;
}

function useEffects() {
  useEffect(() => {
    const rv = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            rv.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );

    document.querySelectorAll(".rv").forEach((el) => rv.observe(el));

    const glow = document.getElementById("glow");

    const onMove = (e: PointerEvent) => {
      if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      }

      const target = e.target as HTMLElement;
      const c = target.closest<HTMLElement>(".cell");

      if (!c) return;

      const r = c.getBoundingClientRect();

      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");

      if (c.classList.contains("proj") && matchMedia("(hover:hover)").matches) {
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;

        c.style.transform =
          `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      }
    };

    const onLeave = (e: PointerEvent) => {
      const target = e.target as HTMLElement;

      if (target.classList?.contains("proj")) {
        target.style.transform = "";
      }
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerout", onLeave);

    return () => {
      rv.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
    };
  }, []);
}

function useActive(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const so = new IntersectionObserver(
      (es) =>
        es.forEach(
          (e) => e.isIntersecting && setActive(e.target.id)
        ),
      { rootMargin: "-45% 0px -50% 0px" }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) so.observe(el);
    });

    return () => so.disconnect();
  }, [ids]);

  return active;
}

function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;

      io.disconnect();

      const t0 = performance.now();

      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 1400);

        el.textContent = String(
          Math.round(to * (1 - Math.pow(1 - k, 3)))
        );

        if (k < 1) {
          raf = requestAnimationFrame(step);
        }
      };

      raf = requestAnimationFrame(step);
    });

    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return <span ref={ref}>0</span>;
}

// Parallaxe de la bannière : la souris décale légèrement chaque élément (variables CSS --px / --py)
function useHeroParallax() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = document.getElementById("hero");
    if (!hero) return;
    const m = (e: PointerEvent) => {
      hero.style.setProperty("--px", String(e.clientX / innerWidth - 0.5));
      hero.style.setProperty("--py", String(e.clientY / innerHeight - 0.5));
    };
    addEventListener("pointermove", m);
    return () => removeEventListener("pointermove", m);
  }, []);
}

// Barre de progression + points du parcours : se remplissent au fil du scroll
function useTimeline() {
  useEffect(() => {
    const tl = document.querySelector<HTMLElement>(".tl");
    if (!tl) return;
    const items = [...tl.querySelectorAll<HTMLElement>(".it")];
    let tick = false;
    const update = () => {
      tick = false;
      const y = innerHeight * 0.62;
      const r = tl.getBoundingClientRect();
      tl.style.setProperty("--tl", String(Math.min(1, Math.max(0, (y - r.top) / r.height))));
      items.forEach((it) => it.classList.toggle("reached", it.getBoundingClientRect().top + 30 < y));
    };
    const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    update();
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, []);
}

const BAND = ["Intégration web", "UI/UX design", "Motion design", "SEO", "Gestion de projet"];
const ids = nav.map(([id]) => id) as string[];

const delay = (d: number) =>
  ({ "--d": d + "s" } as React.CSSProperties);

export default function App() {
  const active = useActive(ids);

  const [open, setOpen] = useState<number | null>(null);
  const [cat, setCat] = useState<string>("all");

  const photoRef = useRef<HTMLDivElement>(null);
  const photoTargetRef = useRef<HTMLImageElement>(null);

  const shown =
    cat === "all"
      ? projects
      : projects.filter((p) => p.category === cat);

  useEffects();
  useHeroParallax();
  useTimeline();
  const [sel, setSel] = useState(0);

  const handlePhotoMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const photo = photoRef.current;
    const target = photoTargetRef.current;

    if (!photo || !target) return;

    const r = photo.getBoundingClientRect();

    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    const rx = (y / r.height - 0.5) * -10;
    const ry = (x / r.width - 0.5) * 10;

    target.style.transform =
      `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.025)`;

    photo.style.setProperty("--mx", `${x}px`);
    photo.style.setProperty("--my", `${y}px`);
  };

  const handlePhotoLeave = () => {
    const photo = photoRef.current;
    const target = photoTargetRef.current;

    if (!photo || !target) return;

    target.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";

    photo.style.setProperty("--mx", "50%");
    photo.style.setProperty("--my", "50%");
  };

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const f = new FormData(e.currentTarget);

    const subject = encodeURIComponent(
      "Contact portfolio — " + f.get("name")
    );

    const body = encodeURIComponent(
      f.get("message") + "\n\n" + f.get("email")
    );

    location.href =
      `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Particles />
      <div id="glow" />

      <nav>
        <div className="in">
          {nav.map(([id, label]) => (
            <a
              key={id}
              href={"#" + id}
              className={active === id ? "on" : ""}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section id="accueil">
        <div id="hero">
          <div className="h-word" aria-hidden="true">PORTFOLIO</div>

          <div className="h-text">
            <span className="badge mono rv">
              <span className="dot" />
              Disponible · stage avril 2027
            </span>

            <h1 className="rv" style={delay(0.1)}>
              Salut, moi c'est
              <br />
              <span className="grad madi">{profile.name}.</span>
            </h1>

            <p className="lead rv" style={{ ...delay(0.3), marginTop: 14 }}>
              Étudiante en 2<sup>e</sup> année de BUT MMI à l'Université Clermont Auvergne (Le Puy-en-Velay).
              Je conçois des interfaces qui allient code propre, design soigné et animations qui donnent envie de rester.
            </p>

            <div className="btns rv" style={delay(0.4)}>
              <a className="btn p" href="#projets">Voir mes projets →</a>
              <a className="btn" href="#contact">Me contacter</a>
            </div>
          </div>

          <div className="h-visual rv" style={delay(0.2)}>
            <div className="arch">
              <img src={profile.photo} alt={`Portrait de ${profile.name}`} />
            </div>
            <div className="h-badge" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="60" fill="#d84b7d" />
                <defs><path id="hb" d="M60,60 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0" /></defs>
                <text fontSize="10.5" fontWeight="700" fill="#fff" letterSpacing="1">
                  <textPath href="#hb" textLength="252" lengthAdjust="spacing">DÉVELOPPEUSE WEB • UI/UX • MOTION • </textPath>
                </text>
                <text x="60" y="68" textAnchor="middle" fontSize="22" fill="#fff">✦</text>
              </svg>
            </div>
            <span className="h-chip c1"><i />React</span>
            <span className="h-chip c2 sage"><i />Figma</span>
            <span className="h-chip c3"><i />After Effects</span>
            <span className="h-chip c4 sage"><i />three.js</span>
          </div>
        </div>

        <div className="h-band" aria-hidden="true">
          <div className="h-band-t">
            {[...BAND, ...BAND, ...BAND, ...BAND].map((t, i) => <span key={i}>{t}<b>✦</b></span>)}
          </div>
        </div>
      </section>

      <section id="a-propos">
        <div className="about">

          <div className="rv rv-l" style={delay(0.15)}>
            <p className="tag mono">// à propos</p>

            <h2>Un peu plus sur moi.</h2>

            <p className="about-p">
              Je m'appelle Manon et je suis étudiante en 2
              <sup>e</sup> année de BUT MMI à l'Université Clermont
              Auvergne, au Puy-en-Velay.
            </p>

            <p className="about-p">
              J'aime autant coder une interface que la dessiner ou
              lui donner vie avec du mouvement : développement web,
              UI/UX design et motion design sont mes terrains de jeu.
            </p>

            <p className="about-p">
              Je cherche un stage à partir d'avril 2027 pour
              progresser au sein d'une équipe, et y apporter ma
              curiosité et mon sens du détail.
            </p>

            <div className="chips about-facts">
              <i className="mono">📍 Le Puy-en-Velay</i>
              <i className="mono">🎓 BUT MMI · 2e année</i>
              <i className="mono">🗓️ Stage avril 2027</i>
            </div>

            <div className="stats">
              {[
                [2, "année de BUT"],
                [projects.length, "projets"],
                [tools.length, "outils"]
              ].map(([n, l]) => (
                <div key={l as string}>
                  <b className="mono">
                    <Count to={n as number} />
                  </b>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={photoRef}
            className="photo rv rv-r"
            onMouseMove={handlePhotoMove}
            onMouseLeave={handlePhotoLeave}
          >
            {profile.photo ? (
              <img
                ref={photoTargetRef}
                src={profile.photo}
                alt={`Portrait de ${profile.name}`}
              />
            ) : (
              <div className="photo-ph mono">
                <span>
                  {profile.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <small>ta photo ici</small>
              </div>
            )}
          </div>
        </div>

        <div className="sk">
          <div className="sk-side">
            <p className="tag mono rv">// 5 compétences clés</p>
            <h2 className="rv">Ce que je sais faire.</h2>
            <p className="sk-note rv">Survole ou touche une ligne pour la découvrir.</p>
            <div className="sk-count mono rv">
              <b key={sel}>{String(sel + 1).padStart(2, "0")}</b>
              <span>/ {String(skills.length).padStart(2, "0")}</span>
            </div>
          </div>

          <ul className="sk-list">
            {skills.map((s, i) => (
              <li
                key={s.title}
                className="sk-row rv"
                data-open={sel === i}
                style={delay(i * 0.08)}
                onMouseEnter={() => setSel(i)}
              >
                <button className="sk-head" aria-expanded={sel === i} onClick={() => setSel(i)} onFocus={() => setSel(i)}>
                  <span className="sk-n mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="sk-t">{s.title}</span>
                  <span className="sk-plus" aria-hidden="true">+</span>
                </button>
                <div className="sk-body">
                  <div>
                    <p>{s.text}</p>
                    <span className="sk-ico" aria-hidden="true">{s.icon}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="cell sk-goal rv">
          <h3 className="mono" style={{ color: "var(--acc)" }}>&gt; objectif.txt</h3>
          <p className="mono">Stage dev web / intégration · avril 2027 · mobilité possible.</p>
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
            <button
              key={id}
              role="tab"
              aria-selected={cat === id}
              className={cat === id ? "on" : ""}
              onClick={() => setCat(id)}
            >
              {label}{" "}
              <span className="mono">
                (
                {id === "all"
                  ? projects.length
                  : projects.filter(
                    (p) => p.category === id
                  ).length}
                )
              </span>
            </button>
          ))}
        </div>

        <div className="grid3" key={cat}>
          {shown.map((p, i) => (
            <a
              key={p.title}
              href={p.href}
              className="cell proj pop"
              style={delay((i % 3) * 0.08)}
              onClick={(e) => {
                e.preventDefault();
                setOpen(i);
              }}
            >
              <span className="arrow">↗</span>

              <div
                className="thumb"
                style={
                  {
                    "--c": p.color
                  } as React.CSSProperties
                }
              >
                {p.icon}
              </div>

              <span className="when mono">{p.kind}</span>

              <h3>{p.title}</h3>

              <p>{p.text}</p>

              <div className="chips">
                {p.stack.map((c) => (
                  <i key={c} className="mono">
                    {c}
                  </i>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="parcours">
        <p className="tag mono rv">// timeline</p>
        <h2 className="rv">Parcours.</h2>

        <div className="tl">
          <span className="tl-head" aria-hidden="true" />
          {studies.map((s, i) => (
            <div
              key={s.title}
              className="cell it rv rv-r"
              style={delay(i * 0.08)}
            >
              <span className="when mono">{s.when}</span>

              <h3
                style={
                  s.accent
                    ? { color: "var(--acc)" }
                    : undefined
                }
              >
                {s.title}
              </h3>

              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact">
        <p className="tag mono rv">// contact</p>
        <h2 className="rv">Prêt·e à collaborer ?</h2>

        <div className="bento">
          <div className="cell s2 rv">
            <form onSubmit={send}>
              <input
                name="name"
                placeholder="Ton nom"
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Ton email"
                required
              />

              <textarea
                name="message"
                rows={4}
                placeholder="Ton message"
                required
              />

              <button className="btn p" type="submit">
                Envoyer ↗
              </button>
            </form>
          </div>

          <div
            className="cell s2 rv"
            style={delay(0.1)}
          >
            <div className="links">
              <a href={"mailto:" + profile.email}>
                <span>Email</span>
                <span className="mono">
                  {profile.email}
                </span>
              </a>

              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>LinkedIn</span>
                <span>↗</span>
              </a>

              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>GitHub</span>
                <span>↗</span>
              </a>

              <a
                href={profile.cv}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>CV (PDF)</span>
                <span>↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {open !== null && (
        <ProjectModal
          list={shown}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}

      <footer className="mono">
        © 2026 {profile.name} · Fait avec React, three.js et
        Vercel ·{" "}
        <a
          href="#accueil"
          style={{ color: "var(--acc)" }}
        >
          ↑ haut
        </a>
      </footer>
    </>
  );
}