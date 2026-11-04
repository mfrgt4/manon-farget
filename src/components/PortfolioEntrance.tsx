
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ModelGlb from "./ModelGlb";
import "./PortfolioEntrance.css";

gsap.registerPlugin(ScrollTrigger);

const SKETCHFAB_URL =
  "https://sketchfab.com/3d-models/neeko-star-guardian-8adfbf9088bf416980727b1073b4c673";

function Casier() {
  return (
    <div className="ip-casier">
      <div className="ip-casier__face">
        <div className="ip-casier__topline" />

        <div className="ip-vents">
          <i /><i /><i /><i /><i />
        </div>

        <div className="ip-number">
          <span>MF</span>
        </div>

        <div className="ip-lock">
          <div className="ip-lock__body">
            <span />
          </div>
        </div>

        <div className="ip-handle">
          <span />
        </div>

        <div className="ip-hinge ip-hinge--top" />
        <div className="ip-hinge ip-hinge--middle" />
        <div className="ip-hinge ip-hinge--bottom" />

        <div className="ip-casier__bottomline" />
      </div>
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
        transformPerspective: 1800,
        transformStyle: "preserve-3d",
      });

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

      // 1. Approche progressive du mur
      tl.to(stageRef.current, {
        scale: 1.035,
        duration: 1.3,
        ease: "none",
      });

      // 2. Déverrouillage des cadenas
      tl.to(
        ".ip-padlock",
        {
          rotation: 18,
          y: 18,
          scale: 0.8,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.in",
        },
        ">"
      );

      // 3. Le titre disparaît
      tl.to(
        titleRef.current,
        {
          opacity: 0,
          x: -40,
          duration: 0.8,
          ease: "power2.in",
        },
        "<0.2"
      );

      // 4. Neeko disparaît avant l'ouverture
      tl.to(
        neekoRef.current,
        {
          opacity: 0,
          x: 70,
          scale: 0.96,
          duration: 0.8,
          ease: "power2.in",
        },
        "<"
      );

      // 5. Ouverture des portes
      tl.to(leftDoor, {
        rotateY: -112,
        duration: 2.4,
        ease: "power3.inOut",
      });

      tl.to(
        rightDoor,
        {
          rotateY: 112,
          duration: 2.4,
          ease: "power3.inOut",
        },
        "<"
      );

      // 6. Disparition de l'introduction
      tl.to(rootRef.current, {
        autoAlpha: 0,
        duration: 0.5,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="ip" ref={rootRef}>
      <div className="ip-atmosphere" />

      <div className="ip-stage" ref={stageRef}>
        <div
          className="ip-door ip-door--left"
          ref={leftDoorRef}
        >
          <Casier />
          <Casier />
          <span className="ip-label">Manon Farget</span>
        </div>

        <div
          className="ip-door ip-door--right"
          ref={rightDoorRef}
        >
          <Casier />
          <Casier />
          <span className="ip-label">Portfolio · BUT MMI</span>
        </div>
      </div>

      {/* Personnage 3D interactif */}
      <div className="ip-neeko" ref={neekoRef}>
        <ModelGlb url="/models/neeko.glb" />
      </div>

      {/* Présentation */}
      <div className="ip-title" ref={titleRef}>
        <span className="ip-kicker">
          PORTFOLIO · 2026
        </span>

        <h1>
          Bienvenue dans
          <br />
          <em>mon univers.</em>
        </h1>

        <p>
          Faites défiler pour découvrir
          <span> ↓</span>
        </p>
      </div>

      <div className="ip-credit">
        Modèle 3D :{" "}
        <a
          href={SKETCHFAB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Neeko Star Guardian
        </a>
      </div>
    </div>
  );
}
