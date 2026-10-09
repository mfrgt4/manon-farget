// ✏️ Modifie ici tes contenus : le reste du site se met à jour tout seul.
export const profile = {
  name: "Manon Farget",
  email: "farget.manon@gmail.com",
  linkedin: "https://www.linkedin.com/in/manon-farget-75baa5333/",
  github: "https://github.com/mfrgt4",
  cv: "/images/CV_Manon-FARGET_Graphique.pdf",
  photo: "/images/portrait.png",
  roles: ["Développeuse web", "UI/UX designer", "Motion lover", "Étudiante MMI"],
};
export const nav = [
  ["a-propos", "A propos"], ["boite-a-outils", "Ma boîte à outils"],
  ["projets", "Projets"], ["parcours", "Parcours"], ["contact", "Contact"],
] as const;
export type Skill = { icon: string; title: string; text: string; span?: string };
export const skills: Skill[] = [
  { icon: "𖹭", title: "Communication", text: "Définir le message, identifier la cible et construire une stratégie adaptée au projet.", span: "s2 r2" },
  { icon: "𖹭", title: "Design graphique", text: "Créer une identité visuelle cohérente, travailler la composition, la typographie et l'univers graphique.", span: "s2" },
  { icon: "𖹭", title: "UI/UX Design", text: "Concevoir des interfaces intuitives et réfléchir au parcours et à l'expérience des utilisateurs." },
  { icon: "𖹭", title: "Développement web", text: "Intégrer et développer des sites responsives en travaillant le front-end et le back-end." },
  { icon: "𖹭", title: "Audiovisuel", text: "Créer des montages, animations et contenus multimédias pour enrichir l'identité et la communication du projet.", span: "s2" },
];
export const tools = ["React","TypeScript","three.js","Vite","Vercel","HTML5","CSS3","JavaScript","PHP","SQL","Git","GitHub","Figma","InDesign","Photoshop","Illustrator","After Effects","Premiere Pro","WordPress","SEO","UX Design","Responsive","Accessibilité","Node.js","Gestion de projet","Notion","Affinity"];
export type Media = { type: "image" | "video"; src: string; alt: string; poster?: string };
export type Category = "perso" | "universitaire";
export type Project = { icon: string; title: string; kind: string; text: string; stack: string[]; color: string; href?: string; link?: string; linkLabel?: string; link2?: string; linkLabel2?: string; category: Category; type?: string; media?: Media[]; pitch?: string };
export const projectUrl = (p: Project) => p.link ?? (p.href && p.href !== "#" ? p.href : undefined);
export const categories = [["perso", "Projets personnels"], ["universitaire", "Projets universitaires"]] as const;
export const projects: Project[] = [
  // ===== Projets personnels =====
  { icon: "🎨", title: "Montages", pitch: "Création de Reels Instagram et TikTok sur des films et des séries. L’objectif est de développer mon storytelling et ma compréhension des tendances à travers des visuels. Grâce à l’analyse des statistiques et des tendances, mes contenus ont atteint une large audience.", category: "perso", kind: "Projet perso", text: "Création de montages visuels sur After Effects 2020.", stack: ["After Effects"], color: "#024E32", href: "#", link: "https://www.instagram.com/xxmanclouds/?hl=fr", linkLabel: "Voir mon Instagram", link2: "https://www.tiktok.com/@xxmanclouds?_r=1&_t=ZG-9AOBYnJ3lE9", linkLabel2: "Voir mon TikTok", media: [{ type: "image", src: "/projets/perso-edits.png", alt: "Bannière de mes montages persos" }, { type: "video", src: "/projets/Michaelj_Edit.mp4", alt: "Montage sur Michael Jackson" }, { type: "video", src: "/projets/Hunger-Games_Edit.mp4", alt: "Montage sur Hunger Games" }, { type: "video", src: "/projets/Matrix_Edit2.mp4", alt: "Montage sur Matrix" }, { type: "video", src: "/projets/NaomiLapa_Edit.mp4", alt: "Montage Naomi Lapa" }, { type: "video", src: "/projets/Nami-transitions_Edit.mp4", alt: "Montage sur Nami dans One Piece" }, { type: "video", src: "/projets/Matrix_Edit1.mp4", alt: "Deuxième montage sur Matrix" }, { type: "video", src: "/projets/Daeneris_Edit.mp4", alt: "Montage sur Daenerys" }] },
  { icon: "🕹️", title: "Blog", pitch: "Création d’un blog personnel autour de mes passions. L’objectif est de développer ma créativité et mes compétences en webdesign (HTML, CSS, JavaScript), tout en travaillant la mise en page, l’identité visuelle et l’expérience utilisateur.", category: "perso", kind: "Projet perso", text: "Création d'un blog personnel sur Blogger.", stack: ["Blogger"], color: "#024E32", href: "#", link: "https://thepopstardiary.blogspot.com/", linkLabel: "Voir mon Blog", media: [{ type: "image", src: "/projets/blog.png", alt: "Bannière mon blog" }] },
  { icon: "🌐", title: "Ce portfolio", pitch: "Le site que tu es en train de regarder : React, TypeScript et three.js, avec une sphère 3D interactive, déployé sur Vercel.", category: "perso", kind: "Projet perso", text: "React, TypeScript, sphère 3D, déployé sur Vercel.", stack: ["React", "three.js", "Vercel"], color: "#D13670", href: "#", media: [{ type: "image", src: "/projets/banniere-portfolio.png", alt: "Bannière du portfolio de Manon Farget" }] },

  // ===== Projets universitaires =====
  { icon: "🛒", title: "SAE203 - Concevoir un Site Web avec BDD", pitch: "Création d’un site immersif inspiré de The Vampire Diaries, de la base de données MySQL au développement de l’interface. Réalisation d’un site responsive avec PHP, HTML, CSS et JavaScript, intégrant des filtres interactifs, des animations et un espace administrateur sécurisé.", category: "universitaire", type: "Développement web", kind: "", text: "Site web immersif avec base de données, filtres interactifs et espace administrateur sécurisé.", stack: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"], color: "#D13670", href: "#", link: "https://manon.farget.fr/MysticFalls/", linkLabel: "Découvrir le site", media: [{ type: "image", src: "/projets/Mystic-falls.png", alt: "Aperçu du site immersif Mystic Falls" }] },
  { icon: "📰", title: "SAE102 - IKEA x Animal Crossing", pitch: "Conception de « Le Coin Fruité », une gamme de produits issue d’une collaboration fictive entre IKEA et Animal Crossing. Élaboration d’une stratégie marketing et de communication, avec définition des cibles, des objectifs, de la proposition de valeur et création d’une affiche promotionnelle sur InDesign.", category: "universitaire", type: "Branding & Design", kind: "Projet universitaire", text: "Imagination d’une collaboration entre IKEA et Animal Crossing : « Le Coin Fruité », des meubles inspirés des fruits pour votre intérieur.", stack: ["Stratégie marketing", "Communication", "Conception graphique", "InDesign", "Canva"], color: "#D13670", href: "#", media: [{ type: "image", src: "/projets/Le-Coin-Fruite.jpg", alt: "Affiche promotionnelle de la gamme Le Coin Fruité" }] },
  { icon: "📰", title: "SAE202 - Decathlon Gym, la salle qui vous correspond", pitch: "Création d’une campagne de communication pour Decathlon Gym, un concept de salles de sport éco-conçues et accessibles, incluant une stratégie marketing, une vidéo promotionnelle où j'ai réalisé la prise du son et un site web réalisé avec WordPress.", category: "universitaire", type: "Communication & Marketing", kind: "Projet universitaire", text: "Création d’une campagne de communication pour Decathlon Gym, un concept de salles de sport éco-conçues et accessibles.", stack: ["Stratégie marketing", "Communication", "Création audiovisuelle", "Prise de son", "WordPress", "Figma", "Excel"], color: "#D13670", href: "#", link: "https://decathlongym.sae202.mmilepuy.fr/", linkLabel: "Voir le site", media: [{ type: "image", src: "/projets/Decathlon-Gym.jpg", alt: "Séance de boxe lors d’un entraînement chez Decathlon Gym" }] },
];
export const studies = [
  { when: "2025 — En cours", title: "BUT MMI — Métiers du Multimédia et de l'Internet", text: "Université Clermont Auvergne · Site du Puy-en-Velay", accent: true },
  { when: "2024 — 2025", title: "BUT Informatique", text: "Université Lyon 1 · Site de la Doua, Villeurbanne" },
  { when: "2021 — 2024", title: "Baccalauréat", text: "STI2D option Innovation Technologique et Éco-Conception · Lycée Galilée, Vienne." },
];
export const about = [
  "Je m'appelle Manon et je suis étudiante en 2e année de BUT MMI à l'Université Clermont Auvergne, au Puy-en-Velay.",
  "J'aime autant coder une interface que la dessiner ou lui donner vie avec du mouvement : développement web, UI/UX design et motion design sont mes terrains de jeu.",
  "Je cherche un stage à partir d'avril 2027 pour progresser au sein d'une équipe, et y apporter ma curiosité et mon sens du détail.",
];
export const facts = ["📍 Le Puy-en-Velay", "🎓 BUT MMI · 2e année", "🗓️ Stage avril 2027"];
