
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./PortfolioEntrance.css";

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioEntrance() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(lightRef.current, { opacity: 0, scale: 0.7 });
      gsap.set([leftDoorRef.current, rightDoorRef.current], {
        rotateY: 0,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=2200",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Approche du casier
      timeline.to(sceneRef.current, {
        scale: 1.08,
        duration: 2,
        ease: "none",
      });

      // Disparition du titre
      timeline.to(titleRef.current, {
        opacity: 0,
        y: -50,
        duration: 1,
      }, "<");

      // Lumière à l'intérieur du casier
      timeline.to(lightRef.current, {
        opacity: 1,
        scale: 1.3,
        duration: 1.5,
      });

      // Ouverture des battants
      timeline.to(leftDoorRef.current, {
        rotateY: -115,
        duration: 2,
        ease: "power2.inOut",
      });

      timeline.to(rightDoorRef.current, {
        rotateY: 115,
        duration: 2,
        ease: "power2.inOut",
      }, "<");

      // Passage à travers le casier
      timeline.to(sceneRef.current, {
        scale: 1.5,
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

        <div className="locker-wall">
          <div className="locker-background">
            <span>✦</span>
            <span>♡</span>
            <span>✧</span>
            <span>♡</span>
          </div>

          <div className="locker-light" ref={lightRef}>
            <div className="locker-inside">
              <span>WELCOME TO</span>
              <h2>MY WORLD</h2>
              <p>MANON FARGET · CREATIVE UNIVERSE</p>
            </div>
          </div>

          <div className="locker-title" ref={titleRef}>
            <span className="locker-eyebrow">YOUR NEXT DESTINATION</span>
            <h1>Open my world<span> ♡</span></h1>
            <p>SCROLL TO OPEN ↓</p>
          </div>

          <div className="locker-doors">

            <div className="locker-door left" ref={leftDoorRef}>
              <div className="locker-door-inner">
                <div className="locker-brand">MF ✦</div>
                <div className="locker-vents">
                  <i /><i /><i /><i /><i /><i />
                </div>
                <div className="locker-sticker sticker-heart">♡</div>
                <div className="locker-sticker sticker-star">✦</div>
                <div className="locker-sticker sticker-lips">💋</div>
                <div className="locker-handle" />
                <div className="locker-lock">✧</div>
              </div>
            </div>

            <div className="locker-door right" ref={rightDoorRef}>
              <div className="locker-door-inner">
                <div className="locker-brand">DREAM BIG</div>
                <div className="locker-vents">
                  <i /><i /><i /><i /><i /><i />
                </div>
                <div className="locker-sticker sticker-smile">☻</div>
                <div className="locker-sticker sticker-sparkle">✧</div>
                <div className="locker-sticker sticker-heart2">♡</div>
                <div className="locker-handle" />
                <div className="locker-lock">✧</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
