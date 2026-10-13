import React, { useRef } from "react";
import "./CDCase.css";

type CdCardProps = {
  imgSrc?: string;
  alt?: string;
};

export default function CdCard({
  imgSrc = "/icons/CD.png", // Remplace par le chemin de ton image CD
  alt = "CD Holographique",
}: CdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calcul des pourcentages pour le gradient lumineux (0% à 100%)
    const mouseX = (x / rect.width) * 100;
    const mouseY = (y / rect.height) * 100;

    // Calcul pour l'inclinaison 3D (Tilt)
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -12;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 12;

    card.style.setProperty("--mouse-x", `${mouseX}%`);
    card.style.setProperty("--mouse-y", `${mouseY}%`);
    card.style.setProperty("--rx", `${rotateX}deg`);
    card.style.setProperty("--ry", `${rotateY}deg`);
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    // Remise à zéro fluide
    card.style.setProperty("--rx", `0deg`);
    card.style.setProperty("--ry", `0deg`);
    card.style.setProperty("--mouse-x", `50%`);
    card.style.setProperty("--mouse-y", `50%`);
  };

  return (
    <div
      ref={cardRef}
      className="cd-card"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* L'image de ton CD / boîtier */}
      <img src={imgSrc} alt={alt} className="cd-card__img" />

      {/* Couches de brillance et lumière au survol */}
      <div className="cd-card__glare" aria-hidden="true" />
      <div className="cd-card__shine" aria-hidden="true" />
    </div>
  );
}