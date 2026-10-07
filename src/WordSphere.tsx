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
        m.opacity = on ? 1 : 0.2 + 0.8 * Math.min(Math.max(t, 0), 1);
        m.color.lerp(on ? FG : (s.userData.color as THREE.Color), 0.2);
        s.scale.lerp(on ? s.userData.base.clone().multiplyScalar(1.35) : s.userData.base, 0.2);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
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
