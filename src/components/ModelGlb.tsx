import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Affiche un fichier .glb local avec three.js
export default function ModelGlb({ url }: { url: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.4, 5);

    // Lumières dans la palette du site : rose (--acc) et menthe (--mint)
    scene.add(new THREE.HemisphereLight(0xfbfaf7, 0xa9bcae, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd84b7d, 2.4);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const pivot = new THREE.Group();
    scene.add(pivot);

    let mixer: THREE.AnimationMixer | null = null;

    // Centre et met à l'échelle le modèle
    const place = (obj: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const ctr = box.getCenter(new THREE.Vector3());
      const k = 2.4 / Math.max(size.x, size.y, size.z);
      obj.scale.setScalar(k);
      obj.position.sub(ctr.multiplyScalar(k));
      pivot.add(obj);
      setReady(true);
    };

    new GLTFLoader().load(
      url,
      (gltf) => {
        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(gltf.scene);
          mixer.clipAction(gltf.animations[0]).play();
        }
        place(gltf.scene);
      },
      undefined,
      () => console.warn("Modèle introuvable :", url),
    );

    // Glisser pour faire tourner le modèle
    let dragging = false;
    let lastX = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const up = () => (dragging = false);
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      pivot.rotation.y += (e.clientX - lastX) * 0.01;
      lastX = e.clientX;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    el.addEventListener("pointermove", move);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = clock.getDelta();
      if (mixer && !reduce) mixer.update(dt);
      if (!dragging && !reduce) pivot.rotation.y += 0.25 * dt;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("pointermove", move);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [url]);

  return (
    <div ref={host} style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}>
      <div className={`pe-loading${ready ? " off" : ""}`}>Chargement du modèle</div>
    </div>
  );
}