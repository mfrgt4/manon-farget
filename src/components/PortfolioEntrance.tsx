import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ModelGlb from "./ModelGlb";
import "./PortfolioEntrance.css";

gsap.registerPlugin(ScrollTrigger);

const SKETCHFAB_URL =
  "https://sketchfab.com/3d-models/neeko-star-guardian-8adfbf9088bf416980727b1073b4c673";

// Un casier : grilles d'aération, cadenas suspendu, poignée
function Casier() {
  return (
    <div className="ip-casier">
      <div className="ip-vents">
        <i /><i /><i />
      </div>
      <div className="ip-padlock">
        <span className="ip-shackle" />
        <span className="ip-lockbody" />
      </div>
      <div className="ip-handle" />
    </div>
  );
}

export default function PortfolioEntrance() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const neekoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const leftDoor = leftDoorRef.current;
      const rightDoor = rightDoorRef.current;
      const accueil = document.querySelector<HTMLElement>("#accueil");

      if (!leftDoor || !rightDoor) return;

      gsap.set([leftDoor, rightDoor], {
        rotateY: 0,
        transformPerspective: 1600,
      });

      // L'accueil reste épinglé derrière l'intro pendant tout le scroll :
      // quand les portes s'ouvrent, on le voit directement.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: accueil ?? rootRef.current,
          start: "top top",
          end: "+=2000",
          scrub: 0.8,
          pin: accueil ? true : false,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      // 1. Léger zoom vers les casiers
      tl.to(stageRef.current, { scale: 1.04, duration: 1.2, ease: "none" });

      // 2. Les cadenas se déverrouillent
      tl.to(
        ".ip-padlock",
        {
          rotation: 16,
          y: 12,
          opacity: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "power2.in",
        },
        ">"
      );

      // 3. Le texte et Neeko s'effacent
      tl.to(
        titleRef.current,
        { opacity: 0, x: -50, duration: 0.7, ease: "power2.in" },
        "<0.2"
      );
      tl.to(
        neekoRef.current,
        { opacity: 0, x: 60, duration: 0.7, ease: "power2.in" },
        "<"
      );

      // 4. Les portes s'ouvrent sur l'accueil
      tl.to(leftDoor, { rotateY: -112, duration: 2.2, ease: "power3.inOut" });
      tl.to(
        rightDoor,
        { rotateY: 112, duration: 2.2, ease: "power3.inOut" },
        "<"
      );

      // 5. L'intro disparaît complètement
      tl.to(rootRef.current, { autoAlpha: 0, duration: 0.4 });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="ip" ref={rootRef}>
      <div className="ip-stage" ref={stageRef}>
        <div className="ip-door ip-door--left" ref={leftDoorRef}>
          <Casier />
          <Casier />
          <span className="ip-label">Manon Farget</span>
        </div>

        <div className="ip-door ip-door--right" ref={rightDoorRef}>
          <Casier />
          <Casier />
          <span className="ip-label">Portfolio · BUT MMI</span>
        </div>
      </div>

      {/* Neeko, devant les portes fermées */}
      <div className="ip-neeko" ref={neekoRef}>
        <ModelGlb url="/models/neeko.glb" />
      </div>

      <div className="ip-title" ref={titleRef}>
        <span className="ip-kicker">Portfolio · BUT MMI</span>
        <h1>
          Bienvenue dans <em>mon univers</em>
        </h1>
        <p>Faites défiler pour ouvrir ↓</p>
      </div>

      <div className="ip-credit">
        Manon Farget — Portfolio · Modèle 3D :{" "}
        <a href={SKETCHFAB_URL} target="_blank" rel="noopener noreferrer">
          Neeko Star Guardian
        </a>
      </div>
    </div>
  );
}