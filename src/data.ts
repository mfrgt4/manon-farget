// ✏️ Modifie ici tes contenus : le reste du site se met à jour tout seul.
export const profile = {
  name: "Manon Farget",
  email: "farget.manon@gmail.com",
  linkedin: "https://www.linkedin.com/in/manon-farget-75baa5333/",
  github: "https://github.com/mfrgt4",
  cv: "#",
  photo: "", // ex: "/photo.jpg" (mets ton fichier dans le dossier public/)
  roles: ["Développeuse web", "UI/UX designer", "Motion lover", "Étudiante MMI"],
};
export const nav = [
  ["a-propos", "A propos"], ["boite-a-outils", "Ma boîte à outils"],
  ["projets", "Projets"], ["parcours", "Parcours"], ["contact", "Contact"],
] as const;
export type Skill = { icon: string; title: string; text: string; span?: string };
export const skills: Skill[] = [
  { icon: "⚡", title: "Intégration web", text: "HTML sémantique, CSS moderne, React et TypeScript pour des pages rapides et accessibles.", span: "s2 r2" },
  { icon: "🎨", title: "Design UI/UX", text: "Maquettes Figma, design system, prototypage et tests utilisateurs.", span: "s2" },
  { icon: "🎬", title: "Motion & vidéo", text: "After Effects, Premiere Pro." },
  { icon: "🔎", title: "SEO & contenu", text: "Stratégie éditoriale, référencement." },
  { icon: "🤝", title: "Gestion de projet", text: "Travail en équipe, méthode agile, Git et échanges clairs avec le client.", span: "s2" },
];
export const tools = ["React","TypeScript","three.js","Vite","Vercel","HTML5","CSS3","JavaScript","Tailwind","PHP","SQL","Git","GitHub","Figma","Photoshop","Illustrator","After Effects","Premiere Pro","WordPress","SEO","UX Design","Responsive","Accessibilité","Node.js","Agile","Notion","Blender","API REST"];
// Pour ajouter tes visuels : mets les fichiers dans public/projets/ puis, dans un projet :
// media: [{ type: "image", src: "/projets/boutique-1.jpg", alt: "Page d'accueil" }, { type: "video", src: "/projets/demo.mp4", alt: "Démo" }]
export type Media = { type: "image" | "video"; src: string; alt: string; poster?: string };
export type Project = { icon: string; title: string; kind: string; text: string; stack: string[]; color: string; href: string; category: "scolaire" | "perso"; media?: Media[]; pitch?: string };
export const categories = [["all", "Tous"], ["scolaire", "Projets scolaires"], ["perso", "Projets personnels"]] as const;
export const projects: Project[] = [
  { icon: "🛒", title: "Boutique en ligne", pitch: "Une boutique pensée pour acheter en trois clics : un parcours fluide, un panier qui réagit instantanément et un design qui met le produit en avant.", category: "scolaire", kind: "SAE · équipe de 4", text: "Site e-commerce responsive avec panier dynamique.", stack: ["React", "TypeScript", "PHP"], color: "#D13670", href: "#" },
  { icon: "🎨", title: "Refonte UI d'une app", pitch: "Repartir d'une page blanche pour rendre une application enfin évidente : nouvelle identité, design system complet et prototype testé auprès de vrais utilisateurs.", category: "perso", kind: "Projet perso", text: "Maquettes Figma et design system complet.", stack: ["Figma", "UX"], color: "#024E32", href: "#" },
  { icon: "🎬", title: "Motion design", pitch: "Quelques secondes, beaucoup de rythme. Un générique animé où chaque transition raconte quelque chose.", category: "scolaire", kind: "SAE", text: "Générique animé et habillage vidéo.", stack: ["After Effects"], color: "#D13670", href: "#" },
  { icon: "📰", title: "Blog & SEO", pitch: "Un blog rapide, lisible et construit pour être trouvé : structure sémantique, contenus optimisés et performances au vert.", category: "scolaire", kind: "Projet scolaire", text: "Site WordPress optimisé pour le référencement.", stack: ["WordPress", "SEO"], color: "#D13670", href: "#" },
  { icon: "🕹️", title: "Expérience 3D", pitch: "Une scène en temps réel qui se manipule du bout des doigts. Quand le web devient un terrain de jeu.", category: "perso", kind: "Projet perso", text: "Scène interactive avec three.js.", stack: ["three.js", "TypeScript"], color: "#024E32", href: "#" },
  { icon: "🌐", title: "Ce portfolio", pitch: "Le site que tu es en train de regarder : React, TypeScript et three.js, avec une sphère 3D interactive, déployé sur Vercel.", category: "perso", kind: "Projet perso", text: "React, TypeScript, sphère 3D, déployé sur Vercel.", stack: ["React", "three.js", "Vercel"], color: "#D13670", href: "#" },
];
export const studies = [
  { when: "2025 — 2027", title: "BUT MMI — Métiers du Multimédia et de l'Internet", text: "Université Clermont Auvergne · IUT du Puy-en-Velay. Parcours : à compléter." },
  { when: "2022 — 2025", title: "Baccalauréat", text: "Série / spécialités : à compléter · Lycée : à compléter." },
  { when: "Avril 2027", title: "Stage recherché", text: "Prochaine étape : une équipe qui me fera progresser.", accent: true },
];

// Section « A propos » : modifie librement ces textes
export const about = [
  "Je m'appelle Manon et je suis étudiante en 2e année de BUT MMI à l'Université Clermont Auvergne, au Puy-en-Velay.",
  "J'aime autant coder une interface que la dessiner ou lui donner vie avec du mouvement : développement web, UI/UX design et motion design sont mes terrains de jeu.",
  "Je cherche un stage à partir d'avril 2027 pour progresser au sein d'une équipe, et y apporter ma curiosité et mon sens du détail.",
];
export const facts = ["📍 Le Puy-en-Velay", "🎓 BUT MMI · 2e année", "🗓️ Stage avril 2027"];
