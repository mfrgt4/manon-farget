import { useEffect, useRef, useState } from "react";
import "./CloudAvatar.css";

type CloudAvatarProps = {
  className?: string;
  label?: string;
};

/** A lightweight, animated SVG cloud mascot for a React + TypeScript portfolio. */
export default function CloudAvatar({
  className = "",
  label = "Nuage mascotte animé",
}: CloudAvatarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [expression, setExpression] = useState<"happy" | "curious" | "surprised">("happy");
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (event.clientX - centerX) / Math.max(window.innerWidth / 2, 1);
      const dy = (event.clientY - centerY) / Math.max(window.innerHeight / 2, 1);
      setGaze({ x: Math.max(-1, Math.min(1, dx)) * 4.2, y: Math.max(-1, Math.min(1, dy)) * 3.2 });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

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
        }, 150);
      }, 2200 + Math.random() * 2600);
    };

    scheduleBlink();
    return () => {
      cancelled = true;
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
    };
  }, []);

  const reactToCloud = () => {
    setExpression("surprised");
    window.setTimeout(() => setExpression("curious"), 450);
    window.setTimeout(() => setExpression("happy"), 1500);
  };

  return (
    <div
      ref={rootRef}
      className={`cloud-avatar ${className}`}
      role="img"
      aria-label={label}
      onClick={reactToCloud}
      title="Clique sur le nuage ☁️"
    >
      <span className="cloud-avatar__sparkle cloud-avatar__sparkle--one" aria-hidden="true">✦</span>
      <span className="cloud-avatar__sparkle cloud-avatar__sparkle--two" aria-hidden="true">✧</span>
      <svg className="cloud-avatar__svg" viewBox="0 0 320 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="cloudFill" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f5f0ff" />
          </linearGradient>
          <linearGradient id="cloudShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5d9ef" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#c7b6f4" stopOpacity="0.42" />
          </linearGradient>
          <filter id="cloudShadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#aa91d6" floodOpacity="0.22" />
          </filter>
        </defs>
        <ellipse cx="160" cy="215" rx="88" ry="12" fill="#bda9e5" opacity="0.15" className="cloud-avatar__shadow" />
        <g filter="url(#cloudShadow)" className="cloud-avatar__body">
          <path d="M72 177 C49 176 34 159 34 137 C34 116 50 99 71 98 C70 72 92 51 119 53 C135 23 174 19 197 44 C214 43 231 56 237 74 C263 75 284 95 284 120 C305 130 305 158 286 172 C273 182 255 183 239 183 L81 183 C78 183 75 181 72 177Z" fill="url(#cloudFill)" stroke="#eadff9" strokeWidth="3" />
          <path d="M45 142 C53 164 72 171 92 171 L244 171 C264 171 280 161 285 146 C285 168 268 183 242 184 L80 184 C57 184 42 168 45 142Z" fill="url(#cloudShade)" />
          <ellipse cx="91" cy="135" rx="18" ry="9" fill="#f4a9c9" opacity="0.75" className="cloud-avatar__cheek" />
          <ellipse cx="229" cy="135" rx="18" ry="9" fill="#f4a9c9" opacity="0.75" className="cloud-avatar__cheek" />
          <g className={`cloud-avatar__eyes ${blink ? "is-blinking" : ""}`}>
            <ellipse cx={125 + gaze.x} cy={119 + gaze.y} rx="7" ry={expression === "surprised" ? 11 : 9} fill="#433752" />
            <ellipse cx={195 + gaze.x} cy={119 + gaze.y} rx="7" ry={expression === "surprised" ? 11 : 9} fill="#433752" />
            <circle cx={127 + gaze.x} cy={116 + gaze.y} r="2.2" fill="#fff" />
            <circle cx={197 + gaze.x} cy={116 + gaze.y} r="2.2" fill="#fff" />
          </g>
          {expression === "surprised" ? (
            <ellipse cx="160" cy="145" rx="6" ry="8" fill="#b66e9d" />
          ) : expression === "curious" ? (
            <path d="M151 145 Q160 151 169 141" fill="none" stroke="#b66e9d" strokeWidth="3.5" strokeLinecap="round" />
          ) : (
            <path d="M148 141 Q160 157 172 141" fill="none" stroke="#b66e9d" strokeWidth="3.5" strokeLinecap="round" />
          )}
          <path d="M91 81 C104 64 125 63 139 70" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
        </g>
      </svg>
      <span className="cloud-avatar__caption" aria-hidden="true">hello, toi ♡</span>
    </div>
  );
}
