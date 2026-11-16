import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const R = 2.4;
const PINK = new THREE.Color("#DF729B");
const MINT = new THREE.Color("#f3f4f6");
const FG = new THREE.Color("#f3f4f6");

function makeLabel(text: string, color: THREE.Color): THREE.Sprite {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const font = "600 56px Inter, system-ui, sans-serif";
  ctx.font = font;
  c.width = Math.ceil(ctx.measureText(text).width) + 24;
  c.height = 96;
  ctx.font = font; ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; ctx.textAlign = "center";
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, color: color.clone() }));
  const h = 0.34;
  s.scale.set((c.width / c.height) * h, h, 1);
  s.userData.base = s.scale.clone();
  s.userData.color = color;
  return s;
}

export default function WordSphere({ words }: { words: string[] }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current!;
    // Couleurs des mots : suivent le thème jour / sombre (variables --sph-a, --sph-b, --fg)
    const readPalette = () => {
      const cs = getComputedStyle(document.documentElement);
      const g = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
      PINK.set(g("--sph-a", "#d84b7d")); MINT.set(g("--sph-b", "#171717")); FG.set(g("--fg", "#171717"));
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
    controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true;
    controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 1.2;

    const sprites = words.map((w, i) => {
      const s = makeLabel(w, i % 3 === 0 ? MINT : PINK); // 1 mot sur 3 en blanc, les autres en rose
      const y = 1 - (2 * (i + 0.5)) / words.length, r = Math.sqrt(1 - y * y), a = i * 2.399963;
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
    let focus: THREE.Vector3 | null = null, resume = 0, down = { x: 0, y: 0 };
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onDown = (e: PointerEvent) => { onMove(e); down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 || !hover) return; // glissement = rotation normale
      focus = hover.position.clone().normalize();
      controls.autoRotate = false;
      clearTimeout(resume);
      if (!calm) resume = window.setTimeout(() => { controls.autoRotate = true; }, 3500);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();

    const v = new THREE.Vector3(), tgt = new THREE.Vector3();
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) loop();
    });
    io.observe(el);
    const onVis = () => { if (!document.hidden && visible && !raf) loop(); };
    document.addEventListener("visibilitychange", onVis);
    const loop = () => {
      if (!visible || document.hidden) { raf = 0; return; } // pas de rendu hors écran
      if (focus) {
        camera.position.lerp(focus.clone().multiplyScalar(camera.position.length()), 0.08);
        if (camera.position.distanceTo(focus.clone().multiplyScalar(camera.position.length())) < 0.02) focus = null;
      }
      controls.update();
      ray.setFromCamera(mouse, camera);
      hover = (ray.intersectObjects(sprites)[0]?.object as THREE.Sprite) ?? null;
      el.style.setProperty("cursor", hover ? "pointer" : "grab", "important");
      controls.autoRotateSpeed += ((hover ? 0.25 : 1.2) - controls.autoRotateSpeed) * 0.08; // facile à viser
      const d0 = camera.position.length();
      for (const s of sprites) {
        const t = 1 - (s.getWorldPosition(v).distanceTo(camera.position) - (d0 - R)) / (2 * R); // 1 = devant
        const m = s.material as THREE.SpriteMaterial;
        const on = s === hover;
        const tc = Math.min(Math.max(t, 0), 1);
        m.opacity = on ? 1 : 0.38 + 0.62 * tc;
        m.color.lerp(on ? FG : (s.userData.color as THREE.Color), 0.2);
        s.scale.lerp(tgt.copy(s.userData.base).multiplyScalar((0.88 + 0.24 * tc) * (on ? 1.35 : 1)), 0.2);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener("visibilitychange", onVis); ro.disconnect(); mo.disconnect(); controls.dispose();
      clearTimeout(resume); el.removeEventListener("pointerdown", onDown); el.removeEventListener("pointerup", onUp); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave);
      sprites.forEach((s) => { (s.material as THREE.SpriteMaterial).map?.dispose(); s.material.dispose(); });
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [words]);

  return (
    <div id="cloudbox" ref={box} role="img" aria-label={"Compétences : " + words.join(", ")}>
      <div className="hint mono">↻ glisse pour tourner · clique un mot pour l’amener devant</div>
    </div>
  );
}