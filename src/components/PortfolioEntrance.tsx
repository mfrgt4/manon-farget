import { useEffect, useRef, useState } from "react";
import { profile } from "../data";
import ModelGlb from "./ModelGlb";
import "./PortfolioEntrance.css";

const SKETCHFAB_URL =
  "https://sketchfab.com/3d-models/neeko-star-guardian-8adfbf9088bf416980727b1073b4c673";

export default function PortfolioEntrance() {
  const [phase, setPhase] = useState<"in" | "leaving" | "gone">("in");
  const btn = useRef<HTMLButtonElement>(null);

  const enter = () => {
    if (phase !== "in") return;
    setPhase("leaving");
    window.setTimeout(() => setPhase("gone"), 700);
  };

  // Bloque le scroll du site tant que l'intro est affichée
  useEffect(() => {
    if (phase === "gone") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // Focus sur le bouton + Échap pour passer
  useEffect(() => {
    btn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") enter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={`pe${phase === "leaving" ? " pe--leave" : ""}`}
      role="dialog"
      aria-label="Introduction du portfolio"
    >
      <div className="pe-grid">
        <div className="pe-text">
          <span className="badge">
            <i className="dot" /> Portfolio 2026
          </span>

          <h1 className="pe-title">
            <small>Bonjour, moi c'est</small>
            {profile.name}
          </h1>

          <p className="lead">
            Étudiant·e en MMI, je crée des univers visuels, interactifs et 3D.
          </p>

          <div className="btns">
            <button ref={btn} type="button" className="btn p" onClick={enter}>
              Entrer dans le portfolio
            </button>
          </div>
        </div>

        <div className="pe-stage">
          <ModelGlb url="/models/neeko.glb" />
          <p className="pe-credit">
            Modèle :{" "}
            <a href={SKETCHFAB_URL} target="_blank" rel="noopener noreferrer">
              Neeko Star Guardian
            </a>{" "}
            sur Sketchfab
          </p>
        </div>
      </div>
    </div>
  );
}
