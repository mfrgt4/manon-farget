
import "./WelcomePage.css";

type WelcomePageProps = {
  onEnter: () => void;
};

const BACKGROUND_IMAGE =
  "https://i.pinimg.com/1200x/4f/c9/8e/4fc98e50f7f99f768006607357c039f5.jpg";

const PORTRAIT_GIF =
  "https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUyOWo2Z3UxbHhyeDNxMjhiYTZzNmRrMmRmaHQyOWhoY3ZiZW4zMTJrNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/kZqbBT64ECtjy/giphy.gif";

export default function WelcomePage({ onEnter }: WelcomePageProps) {
  return (
    <main
      className="welcome-screen"
      style={{ "--welcome-background": `url("${BACKGROUND_IMAGE}")` } as React.CSSProperties}
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
          <div className="welcome-logo" aria-hidden="true">
            <span>✦</span>
            <span className="welcome-logo-dot">✧</span>
          </div>

          <div className="welcome-photo-frame">
            <div className="welcome-photo">
              <img src={PORTRAIT_GIF} alt="Animation rétro" />
            </div>
            <span className="welcome-photo-glint" aria-hidden="true">
              ✧
            </span>
          </div>

          <p className="welcome-eyebrow">MANON FARGET · PORTFOLIO CRÉATIF</p>

          <h1 id="welcome-title">
            Prêt·e à découvrir
            <br />
            mon univers créatif ?
          </h1>

          <p className="welcome-subtitle">
            Design · Web · Motion
          </p>

          <button
            className="welcome-enter"
            type="button"
            onClick={onEnter}
            aria-label="Entrer dans mon portfolio"
          >
            <span className="welcome-enter-label">Entrer dans mon univers</span>
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

      <p className="welcome-desktop-note">
        UN PETIT VOYAGE DANS MON UNIVERS NUMÉRIQUE ✦
      </p>
    </main>
  );
}
