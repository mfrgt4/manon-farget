import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
      <div className="ip-door-locker"><LockerDetails /></div>
      <div className="ip-door-locker"><LockerDetails /></div>
      <div className="ip-door-edge" />
      <div className="ip-hinges"><i /><i /><i /></div>
    </div>
  );
}

export default function PortfolioEntrance() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    if (!root || !stage || !leftDoor || !rightDoor) return;

    const ctx = gsap.context(() => {
      gsap.set([leftDoor, rightDoor], {
        rotateY: 0,
        transformPerspective: 1800,
        transformOrigin: "center center",
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: document.querySelector<HTMLElement>("#accueil") ?? root,
          start: "top top",
          end: "+=1500",
          scrub: 0.8,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      timeline.to(stage, { scale: 1.035, duration: 1, ease: "none" });
      timeline.to(titleRef.current, {
        opacity: 0,
        scale: 0.94,
        duration: 0.45,
        ease: "power2.in",
      }, 0.35);
      timeline.to(leftDoor, {
        rotateY: -105,
        duration: 1.5,
        ease: "power2.inOut",
      }, 0.65);
      timeline.to(rightDoor, {
        rotateY: 105,
        duration: 1.5,
        ease: "power2.inOut",
      }, 0.65);
      timeline.to(root, { autoAlpha: 0, duration: 0.25 }, 2.1);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="ip" ref={rootRef} aria-label="Introduction du portfolio">
      <div className="ip-wall" />
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
