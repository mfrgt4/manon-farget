import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import gsap from "gsap";
import "./PortfolioEntrance.css";

const DESKTOP = "(min-width: 901px)";

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

function LockerStickers({ side }: { side: "left" | "right" }) {
  return (
    <>
      {side === "left" && (
        <>
          <div className="ip-sticker ip-sticker--one">
            <img src="https://i.pinimg.com/originals/95/4c/54/954c54617d68eba31d77adfa90404ef8.gif" alt="Sticker animé" />
          </div>
          <div className="ip-sticker ip-sticker--two">
            <img src="https://i.pinimg.com/originals/dd/56/bb/dd56bbfeaf64ac8e20feaa65ee898bf0.gif" alt="Sticker animé" />
          </div>
          <div className="ip-sticker ip-sticker--four">
            <img src="https://i.pinimg.com/originals/93/2f/2c/932f2cf0bc5b42adae73a65f27e0b558.gif" alt="Sticker animé" />
          </div>
          <div className="ip-sticker ip-sticker--five">
            <img src="https://i.pinimg.com/originals/7b/d9/bd/7bd9bd5836aa0d5bdb1964950108af18.gif" alt="Sticker animé" />
          </div>
          <div className="ip-sticker ip-sticker--eight">
            <img src="https://i.pinimg.com/originals/7e/78/17/7e78170337ed44d06823302a491a56b3.gif" alt="Sticker animé" />
          </div>
        </>
      )}

      {side === "right" && (
        <>
          <div className="ip-sticker ip-sticker--three">
            <img src="https://i.pinimg.com/originals/72/bc/ac/72bcac56b668c5c898f0117783f6f8c6.gif" alt="Sticker animé" />
          </div>
          <div className="ip-sticker ip-sticker--six">
            <img src="https://i.pinimg.com/originals/e1/5a/15/e15a1569934cb0898a57210b32c9488f.gif" alt="Sticker animé" />
          </div>
          <div className="ip-sticker ip-sticker--seven">
            <img src="https://i.pinimg.com/originals/3e/d5/00/3ed5009c487c654a0001a97c8d9b381c.gif" alt="Sticker animé" />
          </div>
          <div className="ip-sticker ip-sticker--nine">
            <img src="https://i.pinimg.com/originals/ee/3b/5c/ee3b5c19db3c7a9dacc5e04d9a885fa2.gif" alt="Sticker animé" />
          </div>
          <div className="ip-sticker ip-sticker--ten">
            <img src="https://i.pinimg.com/originals/0e/f6/51/0ef65153115ac5f17c5b577e2d694db0.gif" alt="Sticker animé" />
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

type Phase = "closed" | "opening" | "open";

export default function PortfolioEntrance({
  children,
}: PortfolioEntranceProps) {
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const openingRef = useRef(false);

  const [hasIntro] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia(DESKTOP).matches,
  );
  const [phase, setPhase] = useState<Phase>(hasIntro ? "closed" : "open");

  // Le menu reste caché tant que les casiers sont fermés, puis apparaît en douceur
  useLayoutEffect(() => {
    document.documentElement.dataset.intro =
      phase === "closed" ? "closed" : "open";
  }, [phase]);

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.intro;
    };
  }, []);

  // ---------- Petit son de percussion : toc toc ----------

  const playKnock = () => {
    try {
      const AudioContextClass = window.AudioContext;

      if (!AudioContextClass) return;

      const audio = new AudioContextClass();

      [0, 0.2].forEach((delay) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        const start = audio.currentTime + delay;

        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(105, start);
        oscillator.frequency.exponentialRampToValueAtTime(
          58,
          start + 0.12,
        );

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.16, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.start(start);
        oscillator.stop(start + 0.16);
      });

      window.setTimeout(() => {
        void audio.close();
      }, 900);
    } catch {
      // L'animation fonctionne même si le navigateur bloque le son.
    }
  };

  // ---------- Ouverture des casiers au clic ----------

  const openDoors = () => {
    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    const title = titleRef.current;

    if (openingRef.current || phase !== "closed") return;
    if (!leftDoor || !rightDoor || !title) return;

    openingRef.current = true;
    setPhase("opening");

    // Le fameux toc toc
    playKnock();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("open");
      },
    });

    timelineRef.current = tl;

    // 1. Le titre disparaît doucement
    tl.to(
      title,
      {
        autoAlpha: 0,
        scale: 0.94,
        duration: reducedMotion ? 0.2 : 0.65,
        ease: "power2.in",
      },
      0,
    );

    if (reducedMotion) {
      // Version simplifiée si l'utilisateur préfère limiter les animations
      tl.to(
        leftDoor,
        { xPercent: -100, duration: 0.4, ease: "power1.out" },
        0,
      );

      tl.to(
        rightDoor,
        { xPercent: 100, duration: 0.4, ease: "power1.out" },
        0,
      );

      return;
    }

    // 2. Premier mouvement : les portes réagissent au toc toc
    tl.to(
      leftDoor,
      {
        x: 5,
        duration: 0.09,
        yoyo: true,
        repeat: 3,
        ease: "power1.inOut",
      },
      0.05,
    );

    tl.to(
      rightDoor,
      {
        x: -5,
        duration: 0.09,
        yoyo: true,
        repeat: 3,
        ease: "power1.inOut",
      },
      0.05,
    );

    // 3. Petite pause avant l'ouverture
    tl.to({}, { duration: 0.18 });

    // 4. Les deux battants coulissent dans des directions opposées
    tl.to(
      leftDoor,
      {
        xPercent: -100,
        duration: 1.9,
        ease: "power3.inOut",
      },
      ">",
    );

    tl.to(
      rightDoor,
      {
        xPercent: 100,
        duration: 1.9,
        ease: "power3.inOut",
      },
      "<",
    );
  };

  // ---------- Accessibilité clavier ----------

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDoors();
    }
  };

  // ---------- Gestion du responsive ----------

  useEffect(() => {
    const media = window.matchMedia(DESKTOP);

    const handleResize = () => {
      if (!media.matches) {
        timelineRef.current?.kill();
        openingRef.current = false;
        setPhase("open");
      }
    };

    media.addEventListener("change", handleResize);

    return () => {
      media.removeEventListener("change", handleResize);
      timelineRef.current?.kill();
    };
  }, []);

  return (
    <section
      className={`ip${phase === "opening" ? " is-opening" : ""}${phase === "open" ? " is-open" : ""}`}
      aria-label="Introduction du portfolio"
    >
      {/* Fond */}
      <div className="ip-wall" />

      {/* Contenu du portfolio derrière les casiers */}
      <div
        className="ip-content ip-page"
        data-intro={hasIntro}
        data-play={phase !== "closed"}
      >
        {children}
      </div>

      {/* Les casiers restent affichés pendant l'ouverture */}
      {phase !== "open" && (
        <>
          <div className="ip-stage">
            <LockerDoor side="left" doorRef={leftDoorRef} />
            <LockerDoor side="right" doorRef={rightDoorRef} />
          </div>

          <div className="ip-title" ref={titleRef}>
            <span>Bienvenue dans</span>

            <h1>Mon Portfolio</h1>

            <p className="ip-scroll-hint">
              <span>
                {phase === "opening"
                  ? "Ouverture en cours..."
                  : "Cliquez sur les casiers pour les ouvrir"}
              </span>
              <i>↓</i>
            </p>
          </div>

          {/* Surface accessible pour déclencher l'ouverture */}
          <button
            type="button"
            className="ip-click-area"
            onClick={openDoors}
            onKeyDown={onKeyDown}
            disabled={phase !== "closed"}
            aria-label="Frapper aux casiers et ouvrir les portes"
          />
        </>
      )}
    </section>
  );
}
