import { FormEvent, useEffect, useRef, useState } from "react";
import WordSphere from "./WordSphere";
import ProjectModal from "./ProjectModal";
import { categories, nav, profile, projects, skills, studies, tools } from "./data";
import { projectUrl } from "./data";
import type { Category, Project } from "./data";
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

    };

    window.addEventListener("pointermove", onMove);

    return () => {
      rv.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
}

function useActive(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const so = new IntersectionObserver(
      (es) =>
        es.forEach(
          (e) => e.isIntersecting && setActive(e.target.id === "competences" ? "a-propos" : e.target.id)
        ),
      { rootMargin: "-45% 0px -50% 0px" }
    );

    [...ids, "competences"].forEach((id) => {
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

// Inclinaison 3D ultra fluide : lissage basé sur le temps (identique à 60 ou 144 Hz), retour au repos plus lent que l'aller.
// La variable CSS --p (0 → 1) pilote aussi les effets de survol : tout bouge en même temps, sans à-coup.
function useTilt() {
  useEffect(() => {
    if (!matchMedia("(hover:hover)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    type S = { rx: number; ry: number; p: number; tx: number; ty: number; tp: number; max: number; persp: string };
    const map = new Map<HTMLElement, S>();
    let raf = 0, last = 0, cur: HTMLElement | null = null;
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      let busy = false;
      map.forEach((s, el) => {
        const on = s.tp > 0;
        const kt = 1 - Math.exp(-dt / (on ? 0.09 : 0.3));
        const kp = 1 - Math.exp(-dt / (on ? 0.2 : 0.35));
        s.rx += (s.tx - s.rx) * kt; s.ry += (s.ty - s.ry) * kt; s.p += (s.tp - s.p) * kp;
        if (!on && Math.abs(s.rx) < 0.01 && Math.abs(s.ry) < 0.01 && s.p < 0.001) {
          el.style.transform = ""; el.style.removeProperty("--p"); map.delete(el); return;
        }
        el.style.transform = `${s.persp}rotateX(${s.rx.toFixed(3)}deg) rotateY(${s.ry.toFixed(3)}deg) translateY(${(-6 * s.p).toFixed(3)}px) scale(${(1 + 0.015 * s.p).toFixed(4)})`;
        el.style.setProperty("--p", s.p.toFixed(4));
        busy = true;
      });
      if (busy) raf = requestAnimationFrame(loop); else { raf = 0; last = 0; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const release = (el: HTMLElement) => { const s = map.get(el); if (s) { s.tx = 0; s.ty = 0; s.tp = 0; } };
    const move = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest?.<HTMLElement>("[data-tilt]") ?? null;
      if (cur && cur !== el) { release(cur); kick(); }
      cur = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      let s = map.get(el);
      if (!s) { s = { rx: 0, ry: 0, p: 0, tx: 0, ty: 0, tp: 0, max: Number(el.dataset.tilt) || 8, persp: el.dataset.persp === "none" ? "" : "perspective(900px) " }; map.set(el, s); }
      s.ty = x * s.max * 2; s.tx = -y * s.max * 2; s.tp = 1;
      el.style.setProperty("--gx", (x + 0.5) * 100 + "%"); el.style.setProperty("--gy", (y + 0.5) * 100 + "%");
      kick();
    };
    const out = (e: PointerEvent) => { if (!e.relatedTarget && cur) { release(cur); cur = null; kick(); } };
    addEventListener("pointermove", move); document.addEventListener("pointerout", out);
    return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", move); document.removeEventListener("pointerout", out); };
  }, []);
}

// Apparition « aesthetic » des éléments .aes quand ils entrent dans l'écran (se relance quand le filtre change)
function useAes(dep: string) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll(".aes:not(.in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

// Clic sur un lien d'ancre (#projets…) : la section s'arrête pile au centre de l'écran
function useAnchorCenter() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest?.<HTMLAnchorElement>('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      const sec = id ? document.getElementById(id) : null;
      if (!sec) return;
      e.preventDefault();
      const top = scrollY + sec.getBoundingClientRect().top, h = sec.offsetHeight;
      scrollTo({ top: Math.max(0, h <= innerHeight ? top - (innerHeight - h) / 2 : top), behavior: "smooth" });
      history.replaceState(null, "", "#" + id);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

// Thème jour / sombre : mémorisé dans le navigateur, transition en fondu quand le navigateur sait le faire
type Theme = "light" | "dark";
function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"));
  const choose = (next: Theme) => {
    if (next === theme) return;
    const apply = () => {
      document.documentElement.dataset.theme = next;
      setTheme(next);
      try { localStorage.setItem("theme", next); } catch { /* stockage indisponible */ }
    };
    const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (d.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) d.startViewTransition(apply);
    else apply();
  };
  return [theme, choose] as const;
}

// Image de couverture d'un projet : sa première image (sinon l'emoji)
const cover = (p: Project) => p.media?.find((m) => m.type === "image")?.src;

const BAND = ["Communication", "Design graphique", "UI/UX design", "Développement web", "Audiovisuel"];
const ids = nav.map(([id]) => id) as string[];

const delay = (d: number) =>
  ({ "--d": d + "s" } as React.CSSProperties);

export default function App() {
  const active = useActive(ids);

  const [open, setOpen] = useState<number | null>(null);
  const [cat, setCat] = useState<Category>("perso");
  const [type, setType] = useState("all");

  // Projets universitaires : classés par type. Les types se déduisent de data.ts.
  const univ = projects.filter((p) => p.category === "universitaire");
  const typeOf = (p: Project) => p.type ?? "Autre";
  const types = Array.from(new Set(univ.map(typeOf)));
  const groups: [string, Project[]][] =
    cat === "perso"
      ? [["", projects.filter((p) => p.category === "perso")]]
      : type === "all"
        ? types.map((t) => [t, univ.filter((p) => typeOf(p) === t)] as [string, Project[]])
        : [["", univ.filter((p) => typeOf(p) === type)]];
  const shown = groups.flatMap((g) => g[1]);

  useEffects();
  useHeroParallax();
  useTimeline();
  useTilt();
  useAes(cat + "|" + type);
  useAnchorCenter();
  const [theme, chooseTheme] = useTheme();
  const [sel, setSel] = useState(0);


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

      <div className="theme-toggle" role="group" aria-label="Thème du site" style={{ "--i": theme === "dark" ? 1 : 0 } as React.CSSProperties}>
        <span className="tt-thumb" aria-hidden="true" />
        <button className="tt-btn" aria-pressed={theme === "light"} onClick={() => chooseTheme("light")}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          <span>Jour</span>
        </button>
        <button className="tt-btn" aria-pressed={theme === "dark"} onClick={() => chooseTheme("dark")}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          <span>Sombre</span>
        </button>
      </div>

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
            <span className="h-chip c1"><i />Créative</span>
            <span className="h-chip c2 sage"><i />Rigoureuse</span>
            <span className="h-chip c3"><i />Autonome</span>
            <span className="h-chip c4 sage"><i />Polyvalence</span>
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
            <p className="tag mono">// 01</p>

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
              créativité et mon sens du détail.
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

          <div className="photo rv rv-r">
            <div className="p-tilt" data-tilt="11" data-persp="none">
              <span className="p-outline" aria-hidden="true" />
              <div className="p-frame">
                {profile.photo ? (
                  <img src={profile.photo} alt={`Portrait de ${profile.name}`} />
                ) : (
                  <div className="photo-ph mono">
                    <span>{profile.name.split(" ").map((w) => w[0]).join("")}</span>
                    <small>ta photo ici</small>
                  </div>
                )}
                <span className="p-sheen" aria-hidden="true" />
                <span className="p-glare" aria-hidden="true" />
              </div>
              <span className="p-corner c-tl" aria-hidden="true" />
              <span className="p-corner c-tr" aria-hidden="true" />
              <span className="p-corner c-bl" aria-hidden="true" />
              <span className="p-corner c-br" aria-hidden="true" />
              <span className="p-tag" aria-hidden="true">hello !</span>
            </div>
          </div>
        </div>

      </section>

      <section id="competences">
        <div className="sk">
          <div className="sk-side">
            <p className="tag mono rv">// 02</p>
            <h2 className="rv">Mes 5 compétences clés.</h2>
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

        <div className="cell sk-goal rv" data-tilt="3">
          <h3 className="mono" style={{ color: "var(--acc)" }}>&gt; objectif.txt</h3>
          <p className="mono">Stage dev web / intégration · avril 2027 · mobilité possible.</p>
        </div>
      </section>

      <section id="boite-a-outils">
  <p className="tag mono rv">// 03</p>
  <h2 className="rv">Ma boîte à outils.</h2>
  <p className="tools-inspiration rv">Inspirée de <a href="https://heaven-ghobrial.vercel.app/" target="_blank" rel="noopener noreferrer">Heaven Ghobrial</a>.</p>
  <WordSphere words={tools} />
</section>

      <section id="projets">
        <p className="tag mono rv">// 04</p>
        <h2 className="rv">Projets.</h2>

        <div className="tabs cats rv" role="tablist" aria-label="Catégorie de projets">
          {categories.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={cat === id}
              className={cat === id ? "on" : ""}
              onClick={() => { setCat(id); setType("all"); }}
            >
              {label} <span className="mono">({projects.filter((p) => p.category === id).length})</span>
            </button>
          ))}
        </div>

        <div className={"subtabs" + (cat === "universitaire" ? " open" : "")}>
          <div>
            <div className="tabs sub" role="tablist" aria-label="Type de projet universitaire">
              {["all", ...types].map((t) => (
                <button
                  key={t}
                  role="tab"
                  tabIndex={cat === "universitaire" ? 0 : -1}
                  aria-selected={type === t}
                  className={type === t ? "on" : ""}
                  onClick={() => setType(t)}
                >
                  {t === "all" ? "Tous les types" : t}{" "}
                  <span className="mono">({t === "all" ? univ.length : univ.filter((p) => typeOf(p) === t).length})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div key={cat + "|" + type}>
          {groups.map(([name, list]) => (
            <div className="grp" key={name || "all"}>
              {name && (
                <h3 className="grp-h mono aes">
                  <span>{name}</span>
                  <small>({list.length})</small>
                </h3>
              )}
              <div className="grid3">
                {list.map((p, i) => (
                  <div
                    key={p.title}
                    role="button"
                    tabIndex={0}
                    className="cell proj aes"
                    data-tilt="9"
                    style={delay((i % 3) * 0.08)}
                    onClick={() => setOpen(shown.indexOf(p))}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(shown.indexOf(p)); } }}
                  >
                    <span className="arrow">↗</span>
                    <div className="thumb" style={{ "--c": p.color } as React.CSSProperties}>{cover(p) ? <img src={cover(p)} alt="" loading="lazy" /> : p.icon}</div>
                    <span className="when mono">{p.kind}</span>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                    <div className="chips">
                      {p.stack.map((c) => <i key={c} className="mono">{c}</i>)}
                    </div>
                    {projectUrl(p) && (
                      <div className="proj-actions">
                        <a
                          className="proj-link"
                          href={projectUrl(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          {p.linkLabel ?? "Voir le site"} <span aria-hidden="true">↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="parcours">
        <p className="tag mono rv">// 05</p>
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
        <p className="tag mono rv">// 06</p>
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
