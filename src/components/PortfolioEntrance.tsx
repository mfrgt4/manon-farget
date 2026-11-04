
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

function LockerDoor({
  side,
  doorRef,
}: {
  side: "left" | "right";
  doorRef: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={doorRef} className={`ip-door ip-door--${side}`}>
      {/* Les trois casiers sont solidaires dans ce grand panneau */}
      {[1, 2, 3].map((locker) => (
        <div className="ip-door-locker" key={locker}>
          <LockerDetails />
        </div>
      ))}

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
          end: "+=1200",
          scrub: 0.4,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Le titre disparaît au début de l'ouverture.
      intro.to(
        title,
        {
          autoAlpha: 0,
          scale: 0.96,
          duration: 1.1,
          ease: "power1.out",
        },
        0,
      );

      // Les trois casiers de gauche pivotent ensemble.
      intro.to(
        leftDoor,
        {
          rotationY: 115,
          duration: 1.2,
          ease: "power2.inOut",
        },
        0,
      );

      // Les trois casiers de droite pivotent ensemble.
      intro.to(
        rightDoor,
        {
          rotationY: -115,
          duration: 1.2,
          ease: "power2.inOut",
        },
        0,
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

      {/* Le vrai contenu Accueil apparaît derrière les portes */}
      <div className="ip-content">{children}</div>

      {/* Les deux grands panneaux de trois casiers */}
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
