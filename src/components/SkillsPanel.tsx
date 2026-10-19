import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import "./SkillsPanel.css";

type Domain = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  number: string;
  icon: string;
  tools: string[];
};

const DOMAINS: Domain[] = [
  {
    id: "design",
    title: "Design graphique",
    subtitle: "Créer un univers visuel",
    color: "#e761aa",
    number: "01",
    icon: "/icons/palette_pink.png",
    tools: ["Photoshop", "Illustrator", "InDesign", "Affinity"],
  },
  {
    id: "uiux",
    title: "UI/UX design",
    subtitle: "Imaginer des interfaces",
    color: "#9ab88b",
    number: "02",
    icon: "/icons/mobile_pink.png",
    tools: ["Figma", "UX Design", "Maquettes", "Ergonomie", "Responsive", "Accessibilité"],
  },
  {
    id: "web",
    title: "Développement web",
    subtitle: "Donner vie aux idées",
    color: "#829cf4",
    number: "03",
    icon: "/icons/code_pink.png",
    tools: ["WordPress", "HTML5", "CSS3", "JavaScript", "TypeScript", "React", "three.js", "Vite", "Node.js", "PHP", "SQL", "SEO"],
  },
  {
    id: "video",
    title: "Audiovisuel",
    subtitle: "Raconter en images",
    color: "#efaa82",
    number: "04",
    icon: "/icons/clap_pink.png",
    tools: ["Premiere Pro", "After Effects"],
  },
];

const MAX_X = 8; // inclinaison verticale maximale (degrés)
const MAX_Y = 11; // inclinaison horizontale maximale (degrés)

export default function SkillsPanel() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const grid = el.querySelector<HTMLElement>(".skills-domains");
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".skills-domain"));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const timers: number[] = [];
    const cleanups: Array<() => void> = [];

    cards.forEach((c, i) => c.style.setProperty("--i", String(i)));

    /* 1) Apparition en 3D quand la carte entre à l'écran, puis léger flottement */
    if (reduce || typeof IntersectionObserver === "undefined") {
      cards.forEach((c) => c.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const card = e.target as HTMLElement;
            card.classList.add("is-in");
            io.unobserve(card);
            timers.push(window.setTimeout(() => card.classList.add("is-settled"), 1500));
          }),
        { threshold: 0.2 }
      );
      cards.forEach((c) => io.observe(c));
      cleanups.push(() => io.disconnect());
    }

    if (reduce) return () => cleanups.forEach((f) => f());

    /* 2a) Écran tactile : les cartes s'inclinent selon leur position pendant le défilement */
    if (!fine) {
      let tick = false;
      const update = () => {
        tick = false;
        cards.forEach((c) => {
          const r = c.getBoundingClientRect();
          const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          c.style.setProperty("--rx", `${Math.max(-7, Math.min(7, -k * 12)).toFixed(2)}deg`);
        });
      };
      const onScroll = () => {
        if (!tick) { tick = true; requestAnimationFrame(update); }
      };
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onScroll);
      update();
      cleanups.push(() => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); });
      return () => { cleanups.forEach((f) => f()); timers.forEach(clearTimeout); };
    }

    /* 2b) Souris : inclinaison 3D lissée dans le temps (même fluidité à 60 ou 144 Hz) */
    type S = { rx: number; ry: number; p: number; tx: number; ty: number; tp: number };
    const map = new Map<HTMLElement, S>();
    let raf = 0, last = 0, cur: HTMLElement | null = null;

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      let busy = false;
      map.forEach((s, c) => {
        const on = s.tp > 0;
        const kt = 1 - Math.exp(-dt / (on ? 0.09 : 0.3));
        const kp = 1 - Math.exp(-dt / (on ? 0.2 : 0.35));
        s.rx += (s.tx - s.rx) * kt;
        s.ry += (s.ty - s.ry) * kt;
        s.p += (s.tp - s.p) * kp;
        if (!on && Math.abs(s.rx) < 0.01 && Math.abs(s.ry) < 0.01 && s.p < 0.001) {
          ["--rx", "--ry", "--p", "--tx", "--ty"].forEach((n) => c.style.removeProperty(n));
          map.delete(c);
          return;
        }
        c.style.setProperty("--rx", `${s.rx.toFixed(3)}deg`);
        c.style.setProperty("--ry", `${s.ry.toFixed(3)}deg`);
        c.style.setProperty("--p", s.p.toFixed(4));
        c.style.setProperty("--tx", (s.ry / MAX_Y).toFixed(3));
        c.style.setProperty("--ty", (s.rx / MAX_X).toFixed(3));
        busy = true;
      });
      if (busy) raf = requestAnimationFrame(loop);
      else { raf = 0; last = 0; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const release = (c: HTMLElement) => {
      const s = map.get(c);
      if (s) { s.tx = 0; s.ty = 0; s.tp = 0; }
    };

    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".skills-domain");
      if (cur && cur !== card) { release(cur); kick(); }
      cur = card;

      if (grid) {
        const g = grid.getBoundingClientRect();
        grid.style.setProperty("--sx", `${(-((e.clientY - g.top) / g.height - 0.5) * 3).toFixed(2)}deg`);
        grid.style.setProperty("--sy", `${(((e.clientX - g.left) / g.width - 0.5) * 4).toFixed(2)}deg`);
      }
      if (!card) return;

      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      let s = map.get(card);
      if (!s) { s = { rx: 0, ry: 0, p: 0, tx: 0, ty: 0, tp: 0 }; map.set(card, s); }
      s.ty = (x - 0.5) * 2 * MAX_Y;
      s.tx = -(y - 0.5) * 2 * MAX_X;
      s.tp = 1;
      card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      kick();
    };
    const onLeave = () => {
      if (cur) { release(cur); cur = null; kick(); }
      if (grid) { grid.style.setProperty("--sx", "0deg"); grid.style.setProperty("--sy", "0deg"); }
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    });

    return () => { cleanups.forEach((f) => f()); timers.forEach(clearTimeout); };
  }, []);

  return (
    <div className="skills-panel" ref={root}>
      <span className="skills-orb skills-orb--a" aria-hidden="true" />
      <span className="skills-orb skills-orb--b" aria-hidden="true" />

      <div className="skills-panel-heading">
        <div>
          <span className="skills-panel-kicker mono">// MES DOMAINES</span>
        </div>

        <span className="skills-panel-count mono">04 DOMAINES</span>
      </div>

      <div className="skills-domains">
        {DOMAINS.map((domain) => (
          <article
            className="skills-domain"
            key={domain.id}
            style={{ "--skill-color": domain.color } as CSSProperties}
          >
            <span className="skills-domain-depth" aria-hidden="true" />
            <span className="skills-domain-bignum" aria-hidden="true">{domain.number}</span>

            <div className="skills-domain-header">
              <span className="skills-domain-number mono">{domain.number}</span>

              <div className="skills-domain-icon">
                <img src={domain.icon} alt="" aria-hidden="true" />
              </div>

              <div className="skills-domain-title">
                <h4>{domain.title}</h4>
                <p>{domain.subtitle}</p>
              </div>

              <span className="skills-domain-arrow" aria-hidden="true">↗</span>
            </div>

            <div className="skills-tags" aria-label={`Compétences : ${domain.title}`}>
              {domain.tools.map((tool, index) => (
                <span
                  className="skills-tag"
                  key={tool}
                  style={{ "--tag-index": index } as CSSProperties}
                >
                  <span className="skills-tag-dot" aria-hidden="true" />
                  {tool}
                </span>
              ))}
            </div>

            <span className="skills-domain-glare" aria-hidden="true" />
          </article>
        ))}
      </div>

      <p className="skills-panel-footer mono">IMAGINATION · CRÉATIVITÉ · CONCEPTION</p>
    </div>
  );
}
