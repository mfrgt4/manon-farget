import { useEffect, useRef, type ReactNode, type Ref } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

/* Stickers différents selon le côté de la porte */

function LockerStickers({ side }: { side: "left" | "right" }) {
  return (
    <>
      {side === "left" && (
        <>
          <div className="ip-sticker ip-sticker--one">
            <img
              src="https://i.pinimg.com/originals/95/4c/54/954c54617d68eba31d77adfa90404ef8.gif"
              alt="Sticker animé"
            />
          </div>

          <div className="ip-sticker ip-sticker--two">
            <img
              src="https://i.pinimg.com/originals/dd/56/bb/dd56bbfeaf64ac8e20feaa65ee898bf0.gif"
              alt="Sticker animé"
            />
          </div>

          <div className="ip-sticker ip-sticker--four">
            <img
              src="https://i.pinimg.com/originals/93/2f/2c/932f2cf0bc5b42adae73a65f27e0b558.gif"
              alt="Sticker animé"
            />
          </div>

          <div className="ip-sticker ip-sticker--five">
            <img
              src="https://i.pinimg.com/originals/7b/d9/bd/7bd9bd5836aa0d5bdb1964950108af18.gif"
              alt="Sticker animé"
            />
          </div>

          <div className="ip-sticker ip-sticker--eight">
            <img
              src="https://i.pinimg.com/originals/7e/78/17/7e78170337ed44d06823302a491a56b3.gif"
              alt="Sticker animé"
            />
          </div>
        </>
      )}

      {side === "right" && (
        <>
          <div className="ip-sticker ip-sticker--three">
            <img
              src="https://i.pinimg.com/originals/72/bc/ac/72bcac56b668c5c898f0117783f6f8c6.gif"
              alt="Sticker animé"
            />
          </div>

          <div className="ip-sticker ip-sticker--six">
            <img
              src="https://i.pinimg.com/originals/e1/5a/15/e15a1569934cb0898a57210b32c9488f.gif"
              alt="Sticker animé"
            />
          </div>

          <div className="ip-sticker ip-sticker--seven">
            <img
              src="https://i.pinimg.com/originals/3e/d5/00/3ed5009c487c654a0001a97c8d9b381c.gif"
              alt="Sticker animé"
            />
          </div>

          <div className="ip-sticker ip-sticker--nine">
            <img
              src="https://i.pinimg.com/originals/ee/3b/5c/ee3b5c19db3c7a9dacc5e04d9a885fa2.gif"
              alt="Sticker animé"
            />
          </div>

          <div className="ip-sticker ip-sticker--ten">
            <img
              src="https://i.pinimg.com/originals/0e/f6/51/0ef65153115ac5f17c5b577e2d694db0.gif"
              alt="Sticker animé"
            />
          </div>
        </>
      )}
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
      {[1, 2, 3].map((locker) => (
        <div className="ip-door-locker" key={locker}>
          <LockerDetails />
        </div>
      ))}

      <LockerStickers side={side} />

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

    // L'introduction animée est activée uniquement sur ordinateur.
    const media = gsap.matchMedia();

    media.add("(min-width: 901px)", () => {
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

      intro.to(
        title,
        {
          autoAlpha: 0,
          scale: 0.96,
          duration: 0.8,
          ease: "power1.out",
        },
        0,
      );

      intro.to(
        leftDoor,
        {
          rotationY: 115,
          duration: 1.2,
          ease: "power2.inOut",
        },
        0,
      );

      intro.to(
        rightDoor,
        {
          rotationY: -115,
          duration: 1.2,
          ease: "power2.inOut",
        },
        0,
      );

      const refreshId = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        window.cancelAnimationFrame(refreshId);
      };
    });

    return () => {
      media.revert();
    };
  }, []);

  return (
    <section
      className="ip"
      ref={rootRef}
      aria-label="Introduction du portfolio"
    >
      <div className="ip-wall" />

      {/* Le vrai contenu Accueil reste présent sur tous les écrans */}
      <div className="ip-content">{children}</div>

      {/* Introduction avec les casiers, uniquement sur ordinateur */}
      <div className="ip-stage">
        <LockerDoor side="left" doorRef={leftDoorRef} />
        <LockerDoor side="right" doorRef={rightDoorRef} />
      </div>

      <div className="ip-title" ref={titleRef}>
        <span>Bienvenue dans</span>
        <h1>Mon Portfolio</h1>

        <p className="ip-scroll-hint">
          <span>Faites défiler pour ouvrir</span>
          <i>↓</i>
        </p>
      </div>
    </section>
  );
}