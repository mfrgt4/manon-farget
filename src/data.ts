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
export const tools = ["React", "TypeScript", "three.js", "Vite", "Vercel", "HTML5", "CSS3", "JavaScript", "PHP", "SQL", "Git", "GitHub", "Figma", "InDesign", "Photoshop", "Illustrator", "After Effects", "Premiere Pro", "WordPress", "SEO", "UX Design", "Maquettes", "Ergonomie", "Responsive", "Accessibilité", "Notion", "Affinity"];
export type Media = { type: "image" | "video"; src: string; alt: string; poster?: string };
export type Category = "perso" | "universitaire";
export type Genre =
  | "branding"
  | "developpement"
  | "communication"
  | "audiovisuel";

export type Project = {
  icon: string;
  title: string;
  kind: string;
  text: string;
  stack: string[];
  color: string;
  href?: string;
  link?: string;
  linkLabel?: string;
  link2?: string;
  linkLabel2?: string;
  category: Category;
  genre?: Genre;
  type?: string;
  media?: Media[];
  pitch?: string;
  fit?: "contain";
  collaboration?: "Projet individuel" | "Projet en équipe";
  thumbnail?: string;
};
export const projectUrl = (p: Project) => p.link ?? (p.href && p.href !== "#" ? p.href : undefined);
export const categories = [["perso", "Projets personnels"], ["universitaire", "Projets universitaires"]] as const;
export const projectGenres = [
  ["branding", "Branding & design"],
  ["developpement", "Développement web"],
  ["communication", "Communication & marketing"],
  ["audiovisuel", "Audiovisuel"],
] as const;
export const projects: Project[] = [
  // ===== Projets personnels =====
  { icon: "🎨", title: "Montages", fit: "contain", pitch: "Création de Reels Instagram et TikTok sur des films et des séries. L’objectif est de développer mon storytelling et ma compréhension des tendances à travers des visuels. Grâce à l’analyse des statistiques et des tendances, mes contenus ont atteint une large audience.", category: "perso", kind: "Projet perso", text: "Création de montages visuels sur After Effects 2020.", stack: ["After Effects", "Instagram", "TikTok"], color: "#024E32", href: "#", link: "https://www.instagram.com/xxmanclouds/?hl=fr", linkLabel: "Voir mon Instagram", link2: "https://www.tiktok.com/@xxmanclouds?_r=1&_t=ZG-9AOBYnJ3lE9", linkLabel2: "Voir mon TikTok", thumbnail: "/projets/perso-edits.png", media: [{ type: "video", src: "/projets/KDA_Edit2.mp4", alt: "Montage sur KDA" }, { type: "video", src: "/projets/Michaelj_Edit.mp4", alt: "Montage sur Michael Jackson" }, { type: "video", src: "/projets/Hunger-Games_Edit.mp4", alt: "Montage sur Hunger Games" }, { type: "video", src: "/projets/Matrix_Edit2.mp4", alt: "Montage sur Matrix" }, { type: "video", src: "/projets/NaomiLapa_Edit.mp4", alt: "Montage Naomi Lapa" }, { type: "video", src: "/projets/Nami-transitions_Edit.mp4", alt: "Montage sur Nami dans One Piece" }, { type: "video", src: "/projets/Matrix_Edit1.mp4", alt: "Deuxième montage sur Matrix" }] },
  { icon: "🎨", title: "Le Petit Café", fit: "contain", pitch: "Création de l’identité visuelle d’un café fictif « Le Petit Café », du logo aux supports imprimés, avec des mockups réalistes pour visualiser les créations en situation, dans une direction artistique cosy mêlant rose poudré et tons marron.", category: "perso", kind: "Projet perso", text: "Création d’une identité visuelle pour un café-brunch fictif, avec son logo, son menu et sa carte de visite.", stack: ["Adobe Illustrator", "Adobe InDesign", "Adobe Photoshop", "Pinterest"], color: "#024E32", media: [{ type: "image", src: "/projets/Moodboard_Le-petit-cafe.png", alt: "Moodboard du Petit Café" }, { type: "image", src: "/projets/2.png", alt: "Création du Petit Café 2" }, { type: "image", src: "/projets/3.png", alt: "Création du Petit Café 3" }, { type: "image", src: "/projets/4.png", alt: "Création du Petit Café 4" }, { type: "image", src: "/projets/5.png", alt: "Mockup du Petit Café 5" }, { type: "image", src: "/projets/6.png", alt: "Mockup du Petit Café 6" }] },
  { icon: "🖼️", title: "Affiches", fit: "contain", pitch: "Création d’affiches artistiques sur Adobe Photoshop en explorant différents styles graphiques : minimaliste, maximaliste et rétro. Mes créations développent mon sens de la composition, de la typographie et des couleurs, et cumulent plusieurs dizaines de milliers de vues sur Pinterest sans publicité payante.", category: "perso", kind: "Projet perso", text: "Création d’affiches artistiques avec l'exploration de différentes directions artistiques.", stack: ["Adobe Photoshop", "Pinterest"], color: "#024E32", href: "#", link: "https://fr.pinterest.com/mfrgt/designs-%E0%AD%AD/", linkLabel: "Voir mon Pinterest", media: [{ type: "image", src: "/projets/Affiche_Ariana.png", alt: "Affiche Ariana" }, { type: "image", src: "/projets/Affiche_Chihiro.png", alt: "Affiche Chihiro" }, { type: "image", src: "/projets/Affiche_MJ.png", alt: "Affiche Michael Jackson" }, { type: "image", src: "/projets/Affiche_Ponyo.png", alt: "Affiche Ponyo" }, { type: "image", src: "/projets/Affiche_ZaraLarsson.png", alt: "Affiche Zara Larsson" }, { type: "image", src: "/projets/Affiche_ZaraLarsson2.png", alt: "Deuxième affiche Zara Larsson" }] },
  { icon: "🕹️", title: "Blog", fit: "contain", pitch: "Création d’un blog personnel autour de mes passions, sur le thème les années 2010. Dessus, j’y rédige des petits articles pour partager mes centres d’intérêt. Ce projet me permet de développer ma créativité et mes compétences en webdesign (HTML, CSS, JavaScript), tout en travaillant la mise en page, l’identité visuelle et l’expérience utilisateur.", category: "perso", kind: "Projet perso", text: "Création d'un blog personnel sur Blogger.", stack: ["Blogger", "HTML", "CSS", "JavaScript"], color: "#024E32", href: "#", link: "https://thepopstardiary.blogspot.com/", linkLabel: "Voir mon Blog", media: [{ type: "image", src: "/projets/blog.png", alt: "Bannière mon blog" }, { type: "image", src: "/projets/blog-article.png", alt: "1er article de mon blog" }] },
  { icon: "🌐", title: "Mon portfolio", fit: "contain", pitch: "Mon portfolio présente mes projets personnels et universitaires autour du design graphique, de la création numérique et du développement web. Développé avec React et TypeScript, il propose une interface interactive avec des animations et des galeries d’images et de vidéos pour découvrir mes réalisations et les outils utilisés. J’ai également intégré un mode clair et un mode sombre et porté une grande attention à l’accessibilité pour rendre la navigation possible au clavier. Le site est déployé sur Vercel.", category: "perso", kind: "Projet perso", text: "Portfolio créatif développé avec React et TypeScript, déployé sur Vercel.", stack: ["React", "TypeScript", "Vite", "three.js", "CSS", "Canvas 2D", "Vercel", "GitHub"], color: "#D13670", href: "#", media: [{ type: "image", src: "/projets/banniere-portfolio.png", alt: "Bannière du portfolio de Manon Farget" }] },


  // ===== Projets universitaires =====
  { icon: "🛒", title: "Plongez dans l’univers du surnaturel", fit: "contain", collaboration: "Projet individuel", pitch: "Création d’un site immersif inspiré de la série The Vampire Diaries, allant de la base de données MySQL au développement de l’interface. Réalisation d’un site responsive avec PHP, HTML, CSS et JavaScript, intégrant des filtres interactifs, des animations et un espace administrateur sécurisé.", category: "universitaire", genre: "developpement", type: "Développement web", kind: "Projet universitaire", text: "Site web immersif avec base de données, filtres interactifs et espace administrateur sécurisé.", stack: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"], color: "#D13670", href: "#", link: "https://manon.farget.fr/MysticFalls/", linkLabel: "Découvrir le site", link2: "/projets/WireframeAugmenté.pdf", linkLabel2: "Voir mon wireframe augmenté ・ PDF", thumbnail: "/projets/tvd-intro.jpg", media: [{ type: "image", src: "/projets/Mystic1.png", alt: "Mystic Falls — aperçu 1" }, { type: "image", src: "/projets/Mystic2.png", alt: "Mystic Falls — aperçu 2" }, { type: "image", src: "/projets/Mystic3.png", alt: "Mystic Falls — aperçu 3" }, { type: "image", src: "/projets/Mystic4.png", alt: "Mystic Falls — aperçu 4" }] },
  { icon: "📰", title: "Decathlon Gym, la salle qui vous correspond", collaboration: "Projet en équipe", pitch: "Création d’une campagne de communication pour Decathlon Gym, un concept de salles de sport accessibles, incluant une stratégie marketing, une vidéo promotionnelle où j'ai pris en charge la prise du son et un site web réalisé avec WordPress incluant sa version anglaise.", category: "universitaire", genre: "communication", type: "Communication & Marketing", kind: "Projet universitaire", text: "Création d’une campagne de communication pour Decathlon Gym, un concept de salles de sport éco-conçues et accessibles.", stack: ["Stratégie marketing", "Communication", "Audiovisuelle", "Prise de son", "WordPress", "Figma", "Excel"], color: "#D13670", href: "#", link: "https://decathlongym.sae202.mmilepuy.fr/", linkLabel: "Voir le site", thumbnail: "/projets/Decathlon-Gym.jpg", media: [{ type: "video", src: "https://www.youtube.com/embed/8xoNTbp_2p0?autoplay=1&mute=0", poster: "/projets/Decathlon-Gym.jpg", alt: "Vidéo promotionnelle Decathlon Gym" }] },
  { icon: "📰", title: "IKEA x Animal Crossing", collaboration: "Projet en équipe", pitch: "Conception de « Le Coin Fruité », une gamme de produits issue d’une collaboration fictive entre IKEA et Animal Crossing. Élaboration d’une stratégie marketing et de communication, avec définition des cibles, des objectifs, de la proposition de valeur et création d’une affiche promotionnelle par moi-même.", category: "universitaire", genre: "communication", type: "Communication & Marketing", kind: "Projet universitaire", text: "Imagination d’une collaboration entre IKEA et Animal Crossing : « Le Coin Fruité », des meubles inspirés des fruits pour votre intérieur.", stack: ["Marketing", "Communication", "Stratégie de marque", "Design produit"], color: "#D13670", href: "#", link: "/projets/SAE102_Rendu-final_Manon-FARGET_Serena-SELESQUE_TD2-TP4.pdf", linkLabel: "Voir le dossier final ・ PDF", media: [{ type: "image", src: "/projets/Le-Coin-Fruite.jpg", alt: "Affiche promotionnelle de la gamme Le Coin Fruité" }] },
  { icon: "🎨", title: "Refonte de l'identité visuelle de la D'Jam", fit: "contain", collaboration: "Projet en équipe", pitch: "Modernisation de l’identité visuelle des Jeunes Amis du Musée Crozatier, à travers une palette de couleurs modernes et dynamiques, associée à une forme épurée et facilement reconnaissable. Le symbole du mammouth fait référence aux collections emblématiques du musée et ancre le logo dans son univers culturel. L’ensemble crée une identité originale, mémorable et adaptée à un public jeune, tout en conservant un lien fort avec le patrimoine local.", category: "universitaire", genre: "branding", type: "Communication & Marketing", kind: "Projet universitaire", text: "Renfonte d’une identité visuelle cohérente pour une association culturelle souhaitant viser une cible plus jeune.", stack: ["Adobe Illustrator", "Adobe InDesign"], color: "#D13670", href: "#", link: "/projets/Livrable_Manon-FARGET_Serena-SELESQUE_TP4.pdf", linkLabel: "Voir la charte graphique ・ PDF", media: [{ type: "image", src: "/projets/Poster-A3.png", alt: "Aperçu du projet D'Jam" }, { type: "image", src: "/projets/Logo_Final.png", alt: "Logo final de la D'Jam" }, { type: "image", src: "/projets/Kakemono.png", alt: "Kakémono de la D'Jam" }] },
  { icon: "🍹", title: "How to make a simple mojito ?", collaboration: "Projet en équipe", pitch: "Montage d’un tutoriel vidéo de deux minutes scénarisé en anglais. Préparation du storyboard en équipe, puis j'ai pris en charge la réalisation du montage sur Adobe Premiere Pro avec effets visuels, du sound-design et sous-titres.", category: "universitaire", genre: "audiovisuel", type: "Audiovisuel", kind: "Projet universitaire", text: "Réalisation d’un tutoriel vidéo de deux minutes en anglais, avec montage dynamique, effets visuels, bruitages et sous-titres.", stack: ["Montage vidéo", "Adobe Premiere Pro", "Effets visuels", "Sound design", "Sous-titrage", "Scénarisation"], color: "#D13670", href: "#", thumbnail: "/projets/Mojito.PNG", media: [{ type: "video", src: "https://www.youtube.com/embed/h8vTPvdPInU?autoplay=1&mute=0", alt: "Tutoriel vidéo de préparation d’un mojito" }] },
  { icon: "🍔", title: "The Pit", fit: "contain", collaboration: "Projet individuel", pitch: "Création de l’identité visuelle de « The Pit », un restaurant fictif de Smash Burgers à l’esthétique punk. Le logo est composé d'une typographie gothique rose vif pour un style percutant. L’affiche reprend ces codes avec des lettres imposantes, un burger en noir et blanc et des effets roses dynamiques. Des mockups de carte de visite et d’enseigne permettent de visualiser l’identité en situation réelle.", category: "universitaire", genre: "branding", kind: "Projet universitaire", text: "Création d’un univers graphique inspiré de la culture punk pour une marque de street-food, décliné à travers un logo, une affiche et des supports de communication.", type: "Communication & Marketing", stack: ["Adobe Illustrator", "Adobe Photoshop", "Canva"], color: "#E761AA", href: "#", media: [{ type: "image", src: "/projets/Moodboard_The-Pit_Burger.png", alt: "Moodboard The Pit Burger" }, { type: "image", src: "/projets/Logo_The-Pit_MANON.png", alt: "Logo The Pit" }, { type: "image", src: "/projets/Affiche_The-Pit.png", alt: "Affiche promotionnelle The Pit" }, { type: "image", src: "/projets/Business-Card_Mockup_The-Pit.png", alt: "Mockup de la carte de visite The Pit" }, { type: "image", src: "/projets/Signbaord-at-Night_Mockup_The-Pit.png", alt: "Mockup de l'enseigne The Pit de nuit" }] },
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