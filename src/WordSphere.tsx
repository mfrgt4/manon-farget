import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const R = 2.4;
const PINK = new THREE.Color("#F2A7BE"); // rose pastel
const MINT = new THREE.Color("#FDF3F6"); // blanc laiteux rosé
const FG = new THREE.Color("#FFF5F8");

function makeLabel(text: string, color: THREE.Color): THREE.Sprite {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const font = "400 48px Inter, system-ui, sans-serif"; // plus fin, plus doux
  ctx.font = font;
  ctx.letterSpacing = "4px";
  c.width = Math.ceil(ctx.measureText(text).width) + 72;
  c.height = 96;
  ctx.font = font;
  ctx.letterSpacing = "4px";
  ctx.textBaseline = "middle"; ctx.textAlign = "center";
  // Glow très diffus
  ctx.shadowColor = "rgba(242, 167, 190, 0.28)";
  ctx.shadowBlur = 26;
  ctx.fillStyle = "#fff";
  // CONTOUR doux autour du mot
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.strokeText(text, c.width / 2, c.height / 2 + 1);
  ctx.fillText(text, c.width / 2, c.height / 2 + 1);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, color: color.clone() }));
  const h = 0.34;
  s.scale.set((c.width / c.height) * h, h, 1);
  s.userData.base = s.scale.clone();
  s.userData.color = color;
  return s;
}

type WordSphereProps = {
  words: string[];
  highlightedWords?: string[];
  focusedWord?: string | null;
};

export default function WordSphere({
  words,
  highlightedWords = [],
  focusedWord = null,
}: WordSphereProps) {
  const box = useRef<HTMLDivElement>(null);
  // Refs miroirs : le useEffect THREE ne dépend que de `words`,
  // la boucle de rendu lit les valeurs à jour sans recréer la scène.
  const highlightedRef = useRef<string[]>(highlightedWords);
  const focusedRef = useRef<string | null>(focusedWord);
  highlightedRef.current = highlightedWords;
  focusedRef.current = focusedWord;

  useEffect(() => {
    const el = box.current!;
    // Couleurs des mots : suivent le thème jour / sombre (variables --sph-a, --sph-b, --fg)
    // Mode soft : couleurs toujours claires et pastel, jamais de noir.
    const readPalette = () => {
      const cs = getComputedStyle(document.documentElement);
      const g = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
      PINK.set(g("--sph-a", "#F2A7BE"));
      MINT.set("#FDF3F6");
      FG.set("#FFF5F8");
      const tmp = new THREE.Color(g("--sph-a", "#F2A7BE"));
      const lum = 0.2126 * tmp.r + 0.7152 * tmp.g + 0.0722 * tmp.b;
      if (lum < 0.25) PINK.set("#F2A7BE");
    };
    readPalette();
    const mo = new MutationObserver(readPalette);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    camera.position.set(0, 0, 7);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.04;
    controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 0.6; // très lent, effet flottant

    const sprites = words.map((w, i) => {
      const s = makeLabel(w, i % 5 === 0 ? PINK : MINT); // 1 mot sur 5 en rose pastel
      const y = 1 - (2 * (i + 0.5)) / words.length, r = Math.sqrt(1 - y * y), a = i * 2.399963;
      s.userData.word = w;
      s.position.set(Math.cos(a) * r * R, y * R, Math.sin(a) * r * R);
      scene.add(s);
      return s;
    });

    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(9, 9);
    let hover: THREE.Sprite | null = null;
    const onMove = (e: PointerEvent) => {
      const b = renderer.domElement.getBoundingClientRect();
      mouse.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    };
    const onLeave = () => mouse.set(9, 9);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();

    const v = new THREE.Vector3();
    let raf = 0;
    const loop = () => {
      controls.update();
      ray.setFromCamera(mouse, camera);
      hover = (ray.intersectObjects(sprites)[0]?.object as THREE.Sprite) ?? null;
      el.style.cursor = hover ? "pointer" : "grab";
      const d0 = camera.position.length();
      for (const s of sprites) {
        const t = 1 - (s.getWorldPosition(v).distanceTo(camera.position) - (d0 - R)) / (2 * R); // 1 = devant
        const m = s.material as THREE.SpriteMaterial;
        const on = s === hover;
        const isFocused = focusedRef.current !== null && s.userData.word === focusedRef.current;
        const highlighted = highlightedRef.current;
        const isHighlighted = highlighted.length > 0 && highlighted.includes(s.userData.word as string);
        const dimmed = highlighted.length > 0 && !isHighlighted && !isFocused;

        // Priorité : hover / focus > highlight > dimmed > profondeur
        const depth = Math.pow(Math.min(Math.max(t, 0), 1), 1.2); // courbe douce
        const targetOpacity = on || isFocused
          ? 0.95
          : dimmed
            ? 0.18
            : 0.3 + 0.65 * depth;
        m.opacity = targetOpacity;
        m.color.lerp(on || isFocused ? FG : (s.userData.color as THREE.Color), 0.2);
        const targetScale = on || isFocused
          ? s.userData.base.clone().multiplyScalar(1.3) // hover un peu plus gros
          : isHighlighted
            ? s.userData.base.clone().multiplyScalar(1.08)
            : dimmed
              ? s.userData.base.clone().multiplyScalar(0.9)
              : s.userData.base.clone().multiplyScalar(0.88 + 0.22 * depth);
        s.scale.lerp(targetScale, 0.12); // transition plus douce
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect(); controls.dispose();
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave);
      sprites.forEach((s) => { (s.material as THREE.SpriteMaterial).map?.dispose(); s.material.dispose(); });
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [words]);

  return (
    <div id="cloudbox" ref={box} role="img" aria-label={"Compétences : " + words.join(", ")}>
      <div className="hint mono">↻ glisse pour faire tourner la sphère</div>
    </div>
  );
}
