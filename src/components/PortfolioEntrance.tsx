import { useEffect, useRef, type LegacyRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ModelGlb from "./ModelGlb";
import "./PortfolioEntrance.css";

gsap.registerPlugin(ScrollTrigger);

function LockerDetails() {
  return (
    <>
      <div className="ip-vents ip-vents--top">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="ip-nameplate" />

      <div className="ip-lock-plate">
        <span className="ip-lock-hole" />
      </div>

      <div className="ip-handle">
        <span />
      </div>

      <div className="ip-vents ip-vents--bottom">
        <i />
        <i />
        <i />
        <i />
      </div>
    </>
  );
}

function LockerDoor({
  side,
  doorRef,
}: {
  side: "left" | "right";
  doorRef: LegacyRef<HTMLDivElement>;
}) {
  return (
    <div ref={doorRef} className={`ip-door ip-door--${side}`}>
      <div className="ip-door-locker">
        <LockerDetails />
      </div>

      <div className="ip-door-locker">
        <LockerDetails />
      </div>

      <div className="ip-door-locker">
        <LockerDetails />
      </div>

      <div className="ip-door-edge" />

      <div className="ip-hinges">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export default function PortfolioEntrance() {
  const rootRef = useRef<HTMLElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    const character = characterRef.current;
    const title = titleRef.current;

    if (!root || !leftDoor || !rightDoor || !character || !title) {
      return;
    }

    const context = gsap.context(() => {
      gsap.set(leftDoor, {
        rotationY: 0,
        transformOrigin: "100% 50%",
        transformPerspective: 1800,
        force3D: true,
      });

      gsap.set(rightDoor, {
        rotationY: 0,
        transformOrigin: "0% 50%",
        transformPerspective: 1800,
        force3D: true,
      });

      gsap.set(character, {
        autoAlpha: 0,
        scale: 0.86,
        y: 35,
      });

      gsap.set(title, {
        autoAlpha: 1,
        scale: 1,
      });

      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=1400",
          scrub: 0.8,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      intro.to(
        title,
        {
          autoAlpha: 0,
          scale: 0.94,
          duration: 0.35,
          ease: "power2.in",
        },
        0,
      );

      intro.to(
        character,
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        0.1,
      );

      intro.to(
        leftDoor,
        {
          rotationY: 115,
          duration: 1.25,
          ease: "power2.inOut",
        },
        0.1,
      );

      intro.to(
        rightDoor,
        {
          rotationY: -115,
          duration: 1.25,
          ease: "power2.inOut",
        },
        0.1,
      );

      intro.to(
        root,
        {
          autoAlpha: 0,
          duration: 0.1,
          ease: "none",
        },
        1.34,
      );
    }, root);

    const refreshId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshId);
      context.revert();
    };
  }, []);

  return (
    <section
      className="ip"
      ref={rootRef}
      aria-label="Introduction du portfolio"
    >
      <div className="ip-wall" />

      <div className="ip-character" ref={characterRef}>
        <ModelGlb url="/models/neeko.glb" />
      </div>

      <div className="ip-stage">
        <LockerDoor side="left" doorRef={leftDoorRef} />
        <LockerDoor side="right" doorRef={rightDoorRef} />
      </div>

      <div className="ip-title" ref={titleRef}>
        <span>Bienvenue dans</span>
        <h1>Mon Portfolio</h1>
      </div>
    </section>
  );
}
