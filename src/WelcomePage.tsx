import { useEffect, useRef, useState } from "react";
import "./WelcomePage.css";

type WelcomePageProps = {
  onEnter: () => void;
};

const BACKGROUND_IMAGE =
  "https://image.noelshack.com/fichiers/2026/42/5/1792155953-image-b21f86-je-veux-cette-photo-mais-dans-des-tons-blancs.jpg";

const PORTRAIT_GIF = "https://i.redd.it/fa7yzfkz14u71.gif";

export default function WelcomePage({ onEnter }: WelcomePageProps) {
  const [exiting, setExiting] = useState(false);
  const introSoundRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const introSound = new Audio("/sounds/Intro-welcome.mp3");
    introSound.volume = 0.15;
    introSoundRef.current = introSound;

    const playIntroSound = () => {
      if (hasStartedRef.current) return;

      hasStartedRef.current = true;

      introSound.play().catch(() => {
        // Le navigateur peut bloquer la lecture automatique.
        hasStartedRef.current = false;
      });
    };

    const startIntro = () => {
      playIntroSound();
    };

    // Tentative de lecture dès l'arrivée sur la welcome page.
    playIntroSound();

    // Si la lecture automatique est bloquée, attendre une interaction.
    window.addEventListener("pointerdown", startIntro);
    window.addEventListener("keydown", startIntro);

    return () => {
      window.removeEventListener("pointerdown", startIntro);
      window.removeEventListener("keydown", startIntro);

      introSound.pause();
      introSound.currentTime = 0;
      introSoundRef.current = null;
      hasStartedRef.current = false;
    };
  }, []);

  const handleEnter = () => {
    if (exiting) return;

    setExiting(true);

    // Laisse le temps à la transition de se terminer.
    window.setTimeout(() => {
      introSoundRef.current?.pause();
      onEnter();
    }, 1100);
  };

  return (
    <main
      className={`welcome-screen ${exiting ? "welcome-exit" : ""}`}
      style={
        {
          "--welcome-background": `url("${BACKGROUND_IMAGE}")`,
        } as React.CSSProperties
      }
    >
      <div className="welcome-overlay" aria-hidden="true" />

      <section className="welcome-window" aria-labelledby="welcome-title">
        <header className="welcome-titlebar">
          <div className="welcome-title">
            <span className="welcome-mini-icon" aria-hidden="true">
              ✦
            </span>
            <span>Bienvenue.exe</span>
          </div>

          <div className="welcome-window-controls" aria-hidden="true">
            <span>−</span>
            <span>□</span>
            <span className="welcome-close">×</span>
          </div>
        </header>

        <div className="welcome-content">
          <div className="welcome-photo-frame">
            <div className="welcome-photo">
              <img src={PORTRAIT_GIF} alt="Animation rétro" />
            </div>
          </div>

          <p className="welcome-eyebrow">MANON FARGET · PORTFOLIO CRÉATIF</p>

          <h1 id="welcome-title">
            Prêt·e à découvrir
            <br />
            mon univers créatif ?
          </h1>

          <button
            className="welcome-enter"
            type="button"
            onClick={handleEnter}
            disabled={exiting}
            aria-label="Entrer dans mon portfolio"
          >
            <span className="welcome-enter-label">Voir mon portfolio</span>

            <span className="welcome-arrow" aria-hidden="true">
              →
            </span>
          </button>

          <p className="welcome-hint">Clique sur la flèche pour continuer</p>
        </div>

        <footer className="welcome-statusbar">
          <span>
            <span className="welcome-status-dot" />
            Système prêt
          </span>

          <span>© Manon Farget</span>
        </footer>
      </section>
    </main>
  );
}
