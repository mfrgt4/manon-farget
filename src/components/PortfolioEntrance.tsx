
import { useEffect, useRef, type ReactNode, type Ref } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./PortfolioEntrance.css";

gsap.registerPlugin(ScrollTrigger);

function LockerDetails() {
  return (
    <>
      <div className="ip-vents ip-vents--top">
        <i /><i /><i /><i />
      </div>

      <div className="ip-nameplate" />

      <div className="ip-lock-plate">
        <span className="ip-lock-hole" />
      </div>

      <div className="ip-handle">
        <span />
      </div>

      <div className="ip-vents ip-vents--bottom">
        <i /><i /><i /><i />
      </div>
    </>
  );
}

function FixedLocker() {
  return (
    <div className="ip-fixed-locker">
      <LockerDetails />
    </div>
  );
}

function LockerDoor({
  side,
  doorRef,
}: {
  side: "left" | "right";
  doorRef: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={doorRef} className={`ip-door ip-door--${side}`}>
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

type PortfolioEntranceProps = {
  children: ReactNode;
};

export default function PortfolioEntrance({
  children,
}: PortfolioEntranceProps) {
  const rootRef = useRef<HTMLElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    const title = titleRef.current;

    if (!root || !leftDoor || !rightDoor || !title) return;

    const context = gsap.context(() => {
      gsap.set(leftDoor, {
        rotationY: 0,
        transformOrigin: "0% 50%",
        transformPerspective: 1800,
        force3D: true,
      });

      gsap.set(rightDoor, {
        rotationY: 0,
        transformOrigin: "100% 50%",
        transformPerspective: 1800,
        force3D: true,
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

      // Les deux portes s'ouvrent depuis le milieu vers l'arrière.
      intro.to(leftDoor, {
        rotationY: 115,
        duration: 1.25,
        ease: "power2.inOut",
      }, 0.1);

      intro.to(rightDoor, {
        rotationY: -115,
        duration: 1.25,
        ease: "power2.inOut",
      }, 0.1);

      // Le titre reste visible pendant l'ouverture.
      intro.to(title, {
        autoAlpha: 0,
        scale: 0.94,
        duration: 0.3,
        ease: "power2.in",
      }, 1.15);

      // L'introduction disparaît une fois les portes ouvertes.
      intro.to(root, {
        autoAlpha: 0,
        duration: 0.12,
        ease: "none",
      }, 1.48);
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

      {/* Le vrai contenu Accueil est placé derrière les portes */}
      <div className="ip-content">
        {children}
      </div>

      {/* Les quatre casiers extérieurs restent fixes */}
      <div className="ip-fixed-lockers">
        <FixedLocker />
        <FixedLocker />
        <FixedLocker />
        <FixedLocker />
      </div>

      {/* Les deux portes centrales s'ouvrent */}
      <div className="ip-stage">
        <LockerDoor side="left" doorRef={leftDoorRef} />
        <LockerDoor side="right" doorRef={rightDoorRef} />
      </div>

      {/* Le titre reste au premier plan */}
      <div className="ip-title" ref={titleRef}>
        <span>Bienvenue dans</span>
        <h1>Mon Portfolio</h1>
      </div>
    </section>
  );
}
