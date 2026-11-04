
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Props = {
  url: string;
};

export default function ModelGlb({ url }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let disposed = false;
    let raf = 0;
    let mixer: THREE.AnimationMixer | null = null;
    let model: THREE.Object3D | null = null;

    const clock = new THREE.Clock();

    // Préférence de mouvement
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // =========================
    // RENDERER
    // =========================

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setStatus("error");
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.setClearColor(0x000000, 0);

    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "pan-y";

    el.appendChild(renderer.domElement);

    // =========================
    // SCÈNE
    // =========================

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.15, 4.5);

    // Lumière ambiante
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    // Lumière principale
    const hemisphere = new THREE.HemisphereLight(
      0xfff5fa,
      0x594253,
      1.8
    );
    scene.add(hemisphere);

    // Éclairage principal
    const keyLight = new THREE.DirectionalLight(0xfff4fa, 3.2);
    keyLight.position.set(-3, 5, 6);
    keyLight.castShadow = true;

    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.normalBias = 0.025;

    scene.add(keyLight);

    // Lumière de remplissage froide
    const fillLight = new THREE.DirectionalLight(0xb9d9ff, 1.25);
    fillLight.position.set(4, 1, 4);
    scene.add(fillLight);

    // Contre-jour rose
    const rimLight = new THREE.DirectionalLight(0xff72ba, 2.4);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Lumière douce supplémentaire
    const softLight = new THREE.PointLight(0xffd6eb, 1.2, 10);
    softLight.position.set(-2, 0, 3);
    scene.add(softLight);

    // =========================
    // GROUPE DU PERSONNAGE
    // =========================

    const pivot = new THREE.Group();
    scene.add(pivot);

    // =========================
    // CONTRÔLES
    // =========================

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = !reduceMotion;
    controls.dampingFactor = 0.065;

    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = false;

    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.8;

    controls.minDistance = 2.4;
    controls.maxDistance = 8;

    // Limite les angles pour éviter de retourner complètement le personnage
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI - 0.15;

    controls.target.set(0, 0, 0);

    // =========================
    // CHARGEMENT DU MODÈLE
    // =========================

    const loader = new GLTFLoader();

    loader.load(
      url,

      (gltf) => {
        if (disposed) return;

        model = gltf.scene;

        // Centrage et mise à l'échelle
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());

        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.25 / maxDimension;

        model.scale.setScalar(scale);
        model.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale
        );

        // Optimisation des maillages et activation des ombres
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];

            materials.forEach((material) => {
              if (
                material instanceof THREE.MeshStandardMaterial ||
                material instanceof THREE.MeshPhysicalMaterial
              ) {
                material.envMapIntensity = 1.15;
              }
            });
          }
        });

        pivot.add(model);

        // Sol transparent pour récupérer les ombres
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(30, 30),
          new THREE.ShadowMaterial({
            color: 0x35152b,
            opacity: 0.16,
          })
        );

        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -(size.y * scale) / 2 - 0.025;
        ground.receiveShadow = true;
        scene.add(ground);

        // Position initiale de la caméra
        const distance = Math.max(4.2, maxDimension * scale * 2);

        camera.position.set(0, 0.15, distance);
        camera.lookAt(0, 0, 0);

        controls.target.set(0, 0, 0);
        controls.update();
        controls.saveState();

        // Animations éventuelles du modèle
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((animation) => {
            mixer?.clipAction(animation).play();
          });
        }

        setStatus("ready");
      },

      undefined,

      (error) => {
        if (disposed) return;
        console.error("Erreur de chargement du modèle 3D :", error);
        setStatus("error");
      }
    );

    // =========================
    // INTERACTIONS
    // =========================

    const canvas = renderer.domElement;

    const onPointerDown = () => {
      canvas.style.cursor = "grabbing";
    };

    const onPointerUp = () => {
      canvas.style.cursor = "grab";
    };

    const resetModel = () => {
      controls.reset();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("dblclick", resetModel);

    // =========================
    // RESPONSIVE
    // =========================

    const resize = () => {
      if (!el.clientWidth || !el.clientHeight) return;

      const width = el.clientWidth;
      const height = el.clientHeight;

      renderer.setSize(width, height, false);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();

    // =========================
    // ANIMATION
    // =========================

    const animate = () => {
      if (disposed) return;

      raf = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);

      if (mixer) {
        mixer.update(delta);
      }

      // Pas de rotation automatique :
      // le visiteur garde le contrôle du personnage.
      controls.update();

      renderer.render(scene, camera);
    };

    animate();

    // =========================
    // NETTOYAGE
    // =========================

    return () => {
      disposed = true;

      cancelAnimationFrame(raf);
      observer.disconnect();

      controls.dispose();

      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("dblclick", resetModel);

      mixer?.stopAllAction();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value instanceof THREE.Texture) {
                value.dispose();
              }
            });

            material.dispose();
          });
        }
      });

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [url]);

  return (
    <div
      ref={host}
      className="model-glb"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        touchAction: "pan-y",
      }}
    >
      {status === "loading" && (
        <div className="pe-loading">
          Chargement du modèle...
        </div>
      )}

      {status === "error" && (
        <div className="pe-loading">
          Impossible de charger le modèle 3D
        </div>
      )}

      {status === "ready" && (
        <div className="model-glb__hint">
          <span>✧</span> GLISSER POUR EXPLORER
          <span>·</span> MOLETTE POUR ZOOMER
          <span>·</span> DOUBLE-CLIC POUR RECADRER
        </div>
      )}
    </div>
  );
}
