import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ModelGlb from "./ModelGlb";
import "./PortfolioEntrance.css";

gsap.registerPlugin(ScrollTrigger);

function LockerDetails() {
  return (
    <>
      <div className="ip-vents ip-vents--top"><i /><i /><i /><i /></div>
      <div className="ip-nameplate" />
      <div className="ip-lock-plate">
        <span className="ip-lock-hole" />
      </div>
      <div className="ip-handle"><span /></div>
      <div className="ip-vents ip-vents--bottom"><i /><i /><i /><i /></div>
    </>
  );
}

function LockerDoor({ side }: { side: "left" | "right" }) {
  return (
    <div className={`ip-door ip-door--${side}`}>
      {/* Trois façades par porte : six casiers visibles au total */}
      <div className="ip-door-locker"><LockerDetails /></div>
      <div className="ip-door-locker"><LockerDetails /></div>
      <div className="ip-door-locker"><LockerDetails /></div>
      <div className="ip-door-edge" />
      <div className="ip-hinges"><i /><i /><i /></div>
    </div>
  );
}

export default function PortfolioEntrance() {
  const rootRef = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const wall = wallRef.current;
    const stage = stageRef.current;
    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    const character = characterRef.current;
    const title = titleRef.current;

    if (!root || !wall || !stage || !leftDoor || !rightDoor || !character || !title) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set([leftDoor, rightDoor], {
        rotateY: 0,
        transformPerspective: 1800,
      });
      gsap.set(character, { autoAlpha: 0, scale: 0.88, y: 35 });
      gsap.set(wall, { autoAlpha: 1 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: document.querySelector<HTMLElement>("#accueil") ?? root,
          start: "top top",
          end: "+=1800",
          scrub: 0.8,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      // Léger rapprochement de la rangée de casiers.
      timeline.to(stage, { scale: 1.025, duration: 0.7, ease: "none" }, 0);

      // Le titre disparaît pendant que les portes commencent à s'ouvrir.
      timeline.to(title, {
        autoAlpha: 0,
        scale: 0.92,
        duration: 0.45,
        ease: "power2.in",
      }, 0.35);

      // Le fond se dissipe pour laisser apparaître la vraie section Accueil.
      timeline.to(wall, {
        autoAlpha: 0,
        duration: 1.05,
        ease: "none",
      }, 0.7);

      // Neeko apparaît derrière les portes, au centre.
      timeline.to(character, {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 1.15,
        ease: "power2.out",
      }, 0.72);

      // Les deux grandes portes pivotent depuis leur bord central.
      timeline.to(leftDoor, {
        rotateY: -108,
        duration: 1.5,
        ease: "power2.inOut",
      }, 0.65);

      timeline.to(rightDoor, {
        rotateY: 108,
        duration: 1.5,
        ease: "power2.inOut",
      }, 0.65);

      // À la fin, l'introduction ne masque plus le portfolio.
      timeline.to(root, {
        autoAlpha: 0,
        duration: 0.2,
        ease: "none",
      }, 2.05);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="ip"
      ref={rootRef}
      aria-label="Introduction du portfolio"
    >
      <div className="ip-wall" ref={wallRef} />

      <div className="ip-character" ref={characterRef}>
        <ModelGlb url="/models/neeko.glb" />
      </div>

      <div className="ip-stage" ref={stageRef}>
        <LockerDoor side="left" />
        <LockerDoor side="right" />
      </div>

      <div className="ip-title" ref={titleRef}>
        <span>Bienvenue dans</span>
        <h1>Mon Portfolio</h1>
      </div>
    </section>
  );
}
