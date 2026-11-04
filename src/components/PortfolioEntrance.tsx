
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./PortfolioEntrance.css";

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioEntrance() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=2500",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // 1. Approche de la porte
      timeline.to(sceneRef.current, {
        scale: 1.25,
        duration: 2,
        ease: "none",
      });

      // 2. Le texte disparaît
      timeline.to(titleRef.current, {
        opacity: 0,
        y: -40,
        duration: 0.5,
      }, "<");

      // 3. La lumière apparaît
      timeline.to(lightRef.current, {
        opacity: 1,
        scale: 1.5,
        duration: 1,
      });

      // 4. Ouverture des deux battants
      timeline.to(leftDoorRef.current, {
        rotateY: -105,
        duration: 2,
        ease: "power2.inOut",
      });

      timeline.to(rightDoorRef.current, {
        rotateY: 105,
        duration: 2,
        ease: "power2.inOut",
      }, "<");

      // 5. Traversée de la porte
      timeline.to(sceneRef.current, {
        scale: 2.4,
        opacity: 0,
        duration: 2,
        ease: "power2.in",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="entrance" ref={sectionRef}>
      <div className="entrance-scene" ref={sceneRef}>
        <div className="entrance-light" ref={lightRef} />

        <div className="entrance-title" ref={titleRef}>
          <p>MANON FARGET</p>
          <h1>Enter my world.</h1>
          <span>SCROLL TO ENTER ↓</span>
        </div>

        <div className="door-frame">
          <div className="door left-door" ref={leftDoorRef}>
            <div className="door-decoration">MF</div>
          </div>

          <div className="door right-door" ref={rightDoorRef}>
            <div className="door-decoration">✦</div>
          </div>
        </div>
      </div>
    </section>
  );
