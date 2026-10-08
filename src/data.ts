// ✏️ Modifie ici tes contenus : le reste du site se met à jour tout seul.
export const profile = {
  name: "Manon Farget",
  email: "farget.manon@gmail.com",
  linkedin: "https://www.linkedin.com/in/manon-farget-75baa5333/",
  github: "https://github.com/mfrgt4",
  cv: "#",
  photo: "/images/portrait.png",
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
// 2 catégories de projets. Les projets universitaires sont classés par "type" (ex : "Développement web", "Motion design"…).
// Pour un projet universitaire, renseigne simplement type: "…" : la liste des types se crée toute seule.
export type Category = "perso" | "universitaire";
export type Project = { icon: string; title: string; kind: string; text: string; stack: string[]; color: string; href?: string; link?: string; linkLabel?: string; category: Category; type?: string; media?: Media[]; pitch?: string };
// Lien du projet (site en ligne, GitHub, Figma…) : ajoute link: "https://…" au projet (et linkLabel: "Voir le site" pour changer le texte du bouton).
// Sans link, aucun bouton n'est affiché. (href: "#" peut rester ou être supprimé, il n'est plus nécessaire.)
export const projectUrl = (p: Project) => p.link ?? (p.href && p.href !== "#" ? p.href : undefined);
export const categories = [["perso", "Projets personnels"], ["universitaire", "Projets universitaires"]] as const;
export const projects: Project[] = [
  { icon: "🛒", title: "Boutique en ligne", pitch: "Une boutique pensée pour acheter en trois clics : un parcours fluide, un panier qui réagit instantanément et un design qui met le produit en avant.", category: "universitaire", type: "Développement web", kind: "SAE · équipe de 4", text: "Site e-commerce responsive avec panier dynamique.", stack: ["React", "TypeScript", "PHP"], color: "#D13670", href: "#" },
  { icon: "🎨", title: "Montages visuels", pitch: "Des montages créatifs autour du cinéma et de la musique, mêlant extraits, typographies, effets et transitions pour créer une ambiance visuelle unique.", category: "perso", kind: "Projet perso", text: "Création de montages visuels sur After Effects 2020.", stack: ["After Effects", "Motion Design"], color: "#024E32", href: "https://www.instagram.com/xxmanclouds/?hl=fr", media: [{ type: "image", src: "/projets/perso-edits.png", alt: "Bannière de mes montages persos" }, { type: "video", src: "/projets/Michaelj_Edit.mp4", alt: "Montage sur Michael Jackson" }] },
  { icon: "🎬", title: "Motion design", pitch: "Quelques secondes, beaucoup de rythme. Un générique animé où chaque transition raconte quelque chose.", category: "universitaire", type: "Motion design", kind: "SAE", text: "Générique animé et habillage vidéo.", stack: ["After Effects"], color: "#D13670", href: "#" },
  { icon: "📰", title: "Blog & SEO", pitch: "Un blog rapide, lisible et construit pour être trouvé : structure sémantique, contenus optimisés et performances au vert.", category: "universitaire", type: "SEO & contenu", kind: "Projet universitaire", text: "Site WordPress optimisé pour le référencement.", stack: ["WordPress", "SEO"], color: "#D13670", href: "#" },
  { icon: "🕹️", title: "Blog", pitch: "Un blog personnel consacré aux années 2010, à travers des articles sur la musique, le cinéma, et la mode qui ont marqué cette époque.", category: "perso", kind: "Projet perso", text: "Création d'un blog personnel sur Blogger.", stack: ["Blogger"], color: "#024E32", href: "https://thepopstardiary.blogspot.com/", media: [{ type: "image", src: "/projets/blog.png", alt: "Bannière mon blog" }] },
  { icon: "🌐", title: "Ce portfolio", pitch: "Le site que tu es en train de regarder : React, TypeScript et three.js, avec une sphère 3D interactive, déployé sur Vercel.", category: "perso", kind: "Projet perso", text: "React, TypeScript, sphère 3D, déployé sur Vercel.", stack: ["React", "three.js", "Vercel"], color: "#D13670", href: "#", media: [{ type: "image", src: "/projets/banniere-portfolio.jpg", alt: "Bannière du portfolio de Manon Farget" }] },
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
