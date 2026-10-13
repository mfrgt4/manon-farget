import { useEffect, useRef, useState } from "react";
import "./CloudAvatar.css";

type CloudAvatarProps = {
  className?: string;
  label?: string;
};

/** A super-animated, lively SVG cloud mascot for a React + TypeScript portfolio. */
export default function CloudAvatar({
  className = "",
  label = "Nuage mascotte super animé",
}: CloudAvatarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [expression, setExpression] = useState<"happy" | "curious" | "surprised" | "love" | "sleepy">("happy");
  const [blink, setBlink] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Suivi dynamique de la souris avec effet rebond/fluide
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (event.clientX - centerX) / Math.max(window.innerWidth / 2, 1);
      const dy = (event.clientY - centerY) / Math.max(window.innerHeight / 2, 1);
      // Amplification du regard pour le rendre plus expressif
      setGaze({ 
        x: Math.max(-1, Math.min(1, dx)) * 6.5, 
        y: Math.max(-1, Math.min(1, dy)) * 5 
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  // Système de clignements des yeux naturel et vivant
  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    let openTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        openTimer = setTimeout(() => {
          if (cancelled) return;
          setBlink(false);
          scheduleBlink();
        }, 120);
      }, 1800 + Math.random() * 2200);
    };

    scheduleBlink();
    return () => {
      cancelled = true;
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
    };
  }, []);

  // Réaction au clic avec enchaînement d'émotions funs
  const reactToCloud = () => {
    const moods: ("surprised" | "curious" | "love" | "happy")[] = ["surprised", "love", "curious", "happy"];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    setExpression(randomMood);
    window.setTimeout(() => setExpression("happy"), 1400);
  };

  return (
    <div
      ref={rootRef}
      className={`cloud-avatar ${className} ${isHovered ? "is-hovered" : ""}`}
      role="img"
      aria-label={label}
      onClick={reactToCloud}
      onMouseEnter={() => {
        setIsHovered(true);
        setExpression("curious");
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setExpression("happy");
      }}
      title="Clique ou survole-moi ! ☁️"
    >
      {/* Étoiles et confettis magiques supplémentaires */}
      <span className="cloud-avatar__sparkle cloud-avatar__sparkle--one" aria-hidden="true">✦</span>
      <span className="cloud-avatar__sparkle cloud-avatar__sparkle--two" aria-hidden="true">✧</span>
      <span className="cloud-avatar__sparkle cloud-avatar__sparkle--three" aria-hidden="true">✨</span>

      <svg className="cloud-avatar__svg" viewBox="0 0 320 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="cloudFill" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f3ecff" />
          </linearGradient>
          <linearGradient id="cloudShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd1ec" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#bfa3f8" stopOpacity="0.5" />
          </linearGradient>
          <filter id="cloudShadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#9b7fd3" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Ombre au sol animée */}
        <ellipse cx="160" cy="220" rx="75" ry="10" fill="#9b7fd3" opacity="0.2" className="cloud-avatar__shadow" />

        <g filter="url(#cloudShadow)" className="cloud-avatar__body">
          {/* Corps du nuage */}
          <path d="M72 177 C49 176 34 159 34 137 C34 116 50 99 71 98 C70 72 92 51 119 53 C135 23 174 19 197 44 C214 43 231 56 237 74 C263 75 284 95 284 120 C305 130 305 158 286 172 C273 182 255 183 239 183 L81 183 C78 183 75 181 72 177Z" fill="url(#cloudFill)" stroke="#e4d4f9" strokeWidth="3" />
          <path d="M45 142 C53 164 72 171 92 171 L244 171 C264 171 280 161 285 146 C285 168 268 183 242 184 L80 184 C57 184 42 168 45 142Z" fill="url(#cloudShade)" />

          {/* Joues roses vibrantes */}
          <ellipse cx="91" cy="135" rx="19" ry="9.5" fill="#ff9acb" opacity="0.8" className="cloud-avatar__cheek" />
          <ellipse cx="229" cy="135" rx="19" ry="9.5" fill="#ff9acb" opacity="0.8" className="cloud-avatar__cheek" />

          {/* Yeux expressifs avec suivi de curseur */}
          <g className={`cloud-avatar__eyes ${blink ? "is-blinking" : ""}`}>
            {expression === "love" ? (
              <>
                <text x="117" y="125" fontSize="18">💖</text>
                <text x="187" y="125" fontSize="18">💖</text>
              </>
            ) : (
              <>
                <ellipse cx={125 + gaze.x} cy={119 + gaze.y} rx="7.5" ry={expression === "surprised" ? 12 : 9.5} fill="#382b4a" />
                <ellipse cx={195 + gaze.x} cy={119 + gaze.y} rx="7.5" ry={expression === "surprised" ? 12 : 9.5} fill="#382b4a" />
                <circle cx={127.5 + gaze.x} cy={115.5 + gaze.y} r="2.5" fill="#fff" />
                <circle cx={197.5 + gaze.x} cy={115.5 + gaze.y} r="2.5" fill="#fff" />
              </>
            )}
          </g>

          {/* Bouche dynamique selon l'humeur */}
          {expression === "surprised" ? (
            <ellipse cx="160" cy="146" rx="7" ry="9" fill="#a05286" />
          ) : expression === "curious" ? (
            <path d="M150 146 Q160 154 170 142" fill="none" stroke="#a05286" strokeWidth="3.5" strokeLinecap="round" />
          ) : expression === "love" ? (
            <path d="M150 144 Q160 158 170 144" fill="none" stroke="#ff65a3" strokeWidth="4" strokeLinecap="round" />
          ) : (
            <path d="M147 141 Q160 159 173 141" fill="none" stroke="#a05286" strokeWidth="4" strokeLinecap="round" />
          )}

          {/* Reflets lumineux sur le haut du nuage */}
          <path d="M91 81 C104 64 125 63 139 70" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" opacity="0.9" />
        </g>
      </svg>

      {/* Bulle de texte / Caption interactive */}
      <span className="cloud-avatar__caption" aria-hidden="true">
        {isHovered ? "coucou toi ! ✨" : "hello, par ici ♡"}
      </span>
    </div>
  );
}