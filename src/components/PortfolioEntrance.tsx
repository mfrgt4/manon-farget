
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./PortfolioEntrance.css";

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioEntrance() {
  const sectionRef = useRef<HTMLElement>(null);
  const lockerRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const leftDoor = leftDoorRef.current;
      const rightDoor = rightDoorRef.current;
      const locker = lockerRef.current;

      if (!leftDoor || !rightDoor || !locker) return;

      // Position initiale des portes
      gsap.set([leftDoor, rightDoor], {
        rotateY: 0,
        transformPerspective: 1200,
      });

      gsap.set(lightRef.current, {
        opacity: 0,
        scale: 0.5,
      });

      // Animation permanente des stickers
      gsap.utils.toArray<HTMLElement>(".floating-sticker").forEach(
        (sticker, index) => {
          gsap.to(sticker, {
            y: index % 2 === 0 ? -15 : 15,
            rotation: index % 2 === 0 ? 8 : -8,
            duration: 1.5 + index * 0.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      );

      // Animation liée au défilement
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=2200",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      // 1. Zoom vers le casier
      timeline.to(locker, {
        scale: 1.08,
        duration: 1.5,
        ease: "none",
      });

      // 2. Le casier tremble
      timeline.to(locker, {
        keyframes: [
          { x: -7, rotation: -0.5 },
          { x: 7, rotation: 0.5 },
          { x: -5, rotation: -0.3 },
          { x: 5, rotation: 0.3 },
          { x: 0, rotation: 0 },
        ],
        duration: 0.5,
        ease: "power1.inOut",
      });

      // 3. Le cadenas se déverrouille
      timeline.to(lockRef.current, {
        rotation: 45,
        y: 15,
        scale: 1.2,
        duration: 0.5,
        ease: "back.out(2)",
      });

      // 4. Les poignées s'abaissent
      timeline.to(".locker-handle", {
        rotation: 12,
        duration: 0.4,
        stagger: 0.1,
      }, "<");

      // 5. Le titre disparaît
      timeline.to(titleRef.current, {
        opacity: 0,
        scale: 0.8,
        y: -60,
        duration: 0.7,
      });

      // 6. La lumière intérieure s'allume
      timeline.to(lightRef.current, {
        opacity: 1,
        scale: 1.3,
        duration: 1,
        ease: "power2.out",
      });

      // 7. Les portes s'ouvrent
      timeline.to(leftDoor, {
        rotateY: -115,
        duration: 2,
        ease: "power3.inOut",
      });

      timeline.to(rightDoor, {
        rotateY: 115,
        duration: 2,
        ease: "power3.inOut",
      }, "<");

      // 8. Les stickers s'envolent
      timeline.to(".floating-sticker", {
        scale: 1.8,
        opacity: 0,
        y: -100,
        stagger: 0.08,
        duration: 1,
      }, "<0.5");

      // 9. Traversée du casier
      timeline.to(locker, {
        scale: 1.8,
        opacity: 0,
        duration: 1.5,
        ease: "power2.in",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="entrance" ref={sectionRef}>
      <div className="locker-scene">

        <div className="locker-wall">
          <div className="wall-decoration">✦</div>
          <div className="wall-decoration">♡</div>
          <div className="wall-decoration">✧</div>
        </div>

        <div className="locker" ref={lockerRef}>

          <div className="locker-interior">
            <div className="locker-light" ref={lightRef}>
              <span>WELCOME TO</span>
              <h2>MY WORLD</h2>
              <p>MANON FARGET · CREATIVE UNIVERSE</p>
              <div className="interior-star">✦</div>
            </div>
          </div>

          <div className="locker-door locker-left" ref={leftDoorRef}>
            <div className="door-content">
              <span className="door-label">MANON F. ✦</span>

              <div className="door-vents">
                <i /><i /><i /><i /><i /><i />
              </div>

              <div className="floating-sticker sticker-heart">♡</div>
              <div className="floating-sticker sticker-star">✦</div>
              <div className="floating-sticker sticker-lips">💋</div>

              <div className="locker-handle" />
              <div className="locker-lock" ref={lockRef}>♡</div>
            </div>
          </div>

          <div className="locker-door locker-right" ref={rightDoorRef}>
            <div className="door-content">
              <span className="door-label">DREAM BIG</span>

              <div className="door-vents">
                <i /><i /><i /><i /><i /><i />
              </div>

              <div className="floating-sticker sticker-smile">☻</div>
              <div className="floating-sticker sticker-sparkle">✧</div>
              <div className="floating-sticker sticker-heart2">♡</div>

              <div className="locker-handle" />
            </div>
          </div>

        </div>

        <div className="entrance-title" ref={titleRef}>
          <span>YOUR NEXT DESTINATION</span>
          <h1>Open my world<span>♡</span></h1>
          <p>SCROLL TO UNLOCK ↓</p>
        </div>

        <div className="entrance-corner">MF® — CREATIVE PORTFOLIO</div>
      </div>
    </section>
  );
}
