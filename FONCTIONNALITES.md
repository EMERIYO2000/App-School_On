# SCHOOL ON — Fonctionnalités actuelles du frontend

> Documentation de référence des fonctionnalités de l'application (frontend React).
> Statut : reflète l'état du code au moment de la rédaction (semestre — septembre 2026).
> Dossier concerné : `frontend/`.

---

## 1. Vue d'ensemble

**SCHOOL ON** est une plateforme éducative en ligne qui réunit :
- des **cours** et des **quiz** pour apprendre et s'entraîner ;
- des **mentors vérifiés** (tuteurs) que les apprenants peuvent trouver, contacter et réserver ;
- une **communauté** (forum avec fils de discussion et réponses) ;
- des **certificats** générés côté serveur et **vérifiables** en ligne par quiconque (code public) ;
- un **espace admin** pour piloter la plateforme.

L'application est une **SPA** (single-page application) entièrement en français, responsive,
installable (PWA) et disponible hors-ligne après le premier chargement.

### Rôles

| Rôle | Accès | Emplacement par défaut |
|---|---|---|
| Visiteur (non connecté) | Home, catalogue, community, vérification de certificat, connexion/inscription | `/` |
| **LEARNER** (apprenant) | Espace apprenant complet | `/dashboard` |
| **MENTOR** (tuteur/enseignant) | Espace mentor (cours, apprenants, revenus, vérification) | `/mentor/dashboard` |
| **ADMIN** | Espace d'administration complet | `/admin/dashboard` |

Le rôle est **détecté automatiquement** côté client à partir du profil renvoyé par l'API
(`AuthContext → computeRole`) : ADMIN si `is_admin` / `is_staff` / `user_type = ADMIN` ;
MENTOR si `is_teacher` / `user_type = TEACHER | TUTOR` ; sinon LEARNER.

---

## 2. Stack technique

| Brique | Choix |
|---|---|
| Build | Vite 8 + React 19 (JSX) |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`), design tokens CSS dans `src/index.css` |
| Routage | `react-router-dom` v7 (BrowserRouter, routes imbriquées + guards) |
| API | Axios + interceptor (JWT, refresh automatique, déconnexion sur 401) |
| Icônes | `lucide-react` (100 % SVG, aucun emoji dans l'interface) |
| i18n (multi-langues) | `i18next` + `react-i18next` + `i18next-browser-languagedetector` |
| Notifications UI | Composant Toast maison (`components/ui/Toast.jsx`) |
| PWA | `vite-plugin-pwa` (manifest, service worker Workbox `generateSW`) |
| Outils de dev | `sharp` (génération d'icônes), `oxlint` ; scripts Node de migration (`scripts/`) |

---

## 3. Structure des dossiers

```
frontend/
├─ index.html                 # metas PWA, favicon, script anti-flash thème
├─ vite.config.js             # plugins, proxy /api, config PWA/manifest
├─ scripts/                   # theme-sweep, radius-sweep, gen-icons, gen-maskable
└─ src/
   ├─ main.jsx                # ThemeProvider > BrowserRouter > AuthProvider > ToastProvider > App
   ├─ App.jsx                 # toutes les routes + guards + PwaSupport
   ├─ index.css               # design tokens, mode sombre, utilitaires
   ├─ assets/brand/           # logos SVG/PNG et illustrations de marque
   ├─ layouts/                # PublicLayout, AuthLayout, AppLayouts (learner/mentor/admin)
   ├─ routes/guards.jsx       # PublicRoute, ProtectedRoute, RoleRoute
   ├─ context/                # AuthContext (auth + rôle), ThemeContext (thème)
   ├─ components/
   │  ├─ ui/                  # Button, Card, Input, Badge, Modal, Tabs, Toast, States, ThemeToggle
   │  ├─ navigation/AppShell.jsx  # navigation latérale/hamburger par rôle
   │  ├─ business/            # CourseCard, MentorCard, BookingCard, CertificateCard, QuizEngine, PaymentStatus
   │  └─ pwa/PwaSupport.jsx   # bannières installation / mise à jour / hors-ligne
   ├─ pages/
   │  ├─ public/              # Home, StaticPages, VerifyCertificate
   │  ├─ auth/                # Login, Register, Forgot, Reset, ChooseJourney
   │  ├─ learner/             # 19 pages (cf. §5.3)
   │  ├─ mentor/              # 10 pages (cf. §5.4)
   │  └─ admin/               # 5 pages (cf. §5.5)
   └─ services/               # api.js + auth, courses, payments, profile, extras
```

---

## 4. Routes principales (rappel `App.jsx`)

- **Public** : `/`, `/about`, `/privacy`, `/terms`, `/courses`, `/mentors`, `/community`, `/community/create`, `/community/:postId`, `/verify`, `/certificate/:code`.
- **Auth** : `/login`, `/register`, `/forgot-password`, `/reset-password`, `/choose-journey`.
- **Learner** (protégé) : `/dashboard`, `/learning`, `/course/:courseId/learn`, `/quiz`, `/quiz/:quizId`, `/exams`, `/bookings`, `/progress`, `/certificates`, `/wallet`, `/profile`, `/settings`, `/notifications`, `/courses`, `/courses/:courseId`, `/mentors`, `/mentors/:mentorId`.
- **Mentor** (rôle MENTOR) : `/mentor/dashboard`, `.../courses`, `.../courses/:id`, `.../courses/create`, `.../learners`, `.../bookings`, `.../earnings`, `.../verification`, `.../certificates`, `.../profile`.
- **Admin** (rôle ADMIN) : `/admin/dashboard`, `.../users`, `.../mentors`, `.../courses`, `.../quizzes`, `.../payments`, `.../bookings`, `.../certificates`, `.../reports`, `.../moderation`, `.../settings`.
- **Erreurs** : `/forbidden`, `*` → 404.

Guards : `ProtectedRoute` redirige vers `/login` ; `PublicRoute` redirige un utilisateur
connecté vers sa page d'accueil (`homePathForRole`) ; `RoleRoute` bloque l'accès sinon 403.

---

## 5. Fonctionnalités détaillées

### 5.0 Fonctionnalités publiques (visiteur)

| Page | Fonctionnalités |
|---|---|
| **Home** (`/`) | Héro avec logo, but de la plateforme, CTA ; tuiles **Apprendre / S'entraîner / Mentors / Communauté** ; aperçu des **cours** et **mentors** récents (connecté à l'API, placeholder si vide) ; sections confiance (certificats vérifiables, mobile, Burundi), témoignages, statistiques ; footer complet. |
| **Cours / Mentors / Communauté publics** | Mêmes pages que l'espace apprenant mais accessibles sans connexion (catalogue consultable). |
| **À propos / Confidentialité / CGU** | Pages statiques rédigées. |
| **Vérification d'un certificat** (`/verify`, `/certificate/:code`) | Champ de recherche par code ; consultation du statut (titre, apprenant, émetteur, date, code, état valide/refusé) ; rendu façon certificat sur le **template officiel** (`public/certificate-template.jfif`). |

### 5.1 Authentification

| Page | Fonctionnalités |
|---|---|
| **Connexion** | Identifiant (e-mail ou login) + mot de passe ; gestion des erreurs par champs ; lien mot de passe oublié ; redirige vers l'espace du rôle détecté. |
| **Inscription** | Nom complet, identifiant, e-mail, téléphone, mot de passe ; choix du rôle (je suis un apprenant / je veux être mentor) ; option de **lien parent–enfant / code** (service `users/parent-child`). Après succès → `/choose-journey`. |
| **Mot de passe oublié / Réinitialisation** | Envoi d'e-mail (`password-reset-request`), confirmation avec nouveau mot de passe (`password-reset-confirm`). |
| **Choose Journey** | Écran de bienvenue qui oriente vers explorer les cours, les mentors ou commencer un parcours. |

### 5.2 Espace apprenant (LEARNER)

| Page | Fonctionnalités |
|---|---|
| **Dashboard** | Bonjour personnalisé ; bandeau promo ; stats (cours, quiz, progression) ; liens rapides vers reprendre un cours, quiz, mentors ; rendu des cours inscrits. |
| **Catalogue (Cours)** | Liste des cours : recherche, filtres par catégorie ; `CourseCard` (image, titre, mentor, prix, catégories, badge) ; fallback d'écrans vide lors de l'absence de données. |
| **Détail cours** (`/courses/:courseId`) | Contenu complet (prix, description, durées, leçons), **enrôlement** (gratuit ou via paiement facturé → `payments`), bouton « Commencer », liste des quiz. |
| **Apprentissage** (`/learning`) | Récapitulatif des cours suivis (inscriptions). |
| **Lecture de cours** (`/course/:id/learn`) | Leçon par leçon (vidéo/média), **marquer une leçon comme terminée** ; navigation entre leçons ; progression visible. |
| **Quiz** (`/quiz`, `/quiz/:id`) | Liste des quiz disponibles + **lecteur de quiz** (`QuizEngine`) : démarrage (`start`), questions, soumission (`submit`), score, reprise. |
| **Examens** (`/exams`) | Examens finaux de cours (même mécanique que les quiz). |
| **Progression** (`/progress`) | Synthèse de l'avancement : leçons validées, quiz passés, examens, barres de progression. |
| **Mentors** (`/mentors`, `/mentors/:id`) | Recherche de mentors ; **mentors proches** via géolocalisation (`navigator.geolocation` + champ rayon → `users/nearby-tutors`) ; carte mentor ; **fiche détaillée** (bio, matières, notes) et **demande de réservation** (booking). |
| **Réservations / Bookings** (`/bookings`) | Liste des demandes/réservations avec statut de paiement (`PaymentStatus`). |
| **Mes certificats** (`/certificates`) | Liste des certificats obtenus, lien de **vérification publique** vers `/certificate/:code`. |
| **Portefeuille / Wallet** (`/wallet`) | Aperçu du solde, historique des transactions, rechargement/paiement via `payments`. |
| **Communauté** (`/community/...`) | Forum : liste des fils, création d'un sujet, page de détail avec **réponses** (`threads`, `replies`). |
| **Profil** (`/profile`) | Infos personnelles ; **avatar** (upload `profile/avatar/`) ; **localisation** (`profile/location/`) ; réutilisé par le mentor et l'admin. |
| **Paramètres** (`/settings`) | Changement de **mot de passe**, gestion des sessions (déconnexion de tous les appareils), clef **FCM** pour notifications push ; option lien parent-enfant. |
| **Notifications** (`/notifications`) | Centre de notifications (UI locale sur liste reçue). |

### 5.3 Espace mentor (MENTOR)

| Page | Fonctionnalités |
|---|---|
| **Dashboard** | Stats (revenus, apprenants, vues), aperçu des cours, demandes récentes. |
| **Mes cours** (`/mentor/courses`) | Liste des cours du mentor, accès au détail (leçons, inscriptions). |
| **Créer un cours** (`/mentor/courses/create`) | Formulaire de création (`POST courses/courses/`) : titre, catégories, prix, description. |
| **Mes apprenants** (`/mentor/learners`) | Apprenants inscrits à ses cours. |
| **Réservations** (`/mentor/bookings`) | Demandes de séances des apprenants + statuts. |
| **Revenus** (`/mentor/earnings`) | Historique de gains via `payments`. |
| **Vérification mentor** (`/mentor/verification`) | Statut (non vérifié / en attente / vérifié), **checklist requis** (pièces, bio, matières) ; mise à jour complète du profil tuteur (`PATCH profile/tutor/`) + rafraîchissement des infos en session. |
| **Mes certificats** (`/mentor/certificates`) | Certificats de l'utilisateur (même vue que l'apprenant). |
| **Profil** | Même page `ProfilePage` que l'apprenant. |

### 5.4 Espace admin (ADMIN)

| Page | Fonctionnalités |
|---|---|
| **Dashboard** (`/admin/dashboard`, onglet reports) | Statistiques globales (utilisateurs, cours, paiements, revenus) ; graphique/palette des rapports. |
| **Utilisateurs & Mentors** (`/admin/users`, `/admin/mentors`) | Liste des utilisateurs (recherche/filtres), focus sur les **mentors** et leurs demandes de vérification. |
| **Cours / Quiz / Certificats** (`/admin/courses`, `/admin/quizzes`, `/admin/certificates`) | Modération des contenus : liste des cours, des quiz, des certificats émis. |
| **Paiements / Réservations / Modération** (`/admin/payments`, `/admin/bookings`, `/admin/moderation`) | Suivi des paiements, réservations et contenus signalés (`payments`, `bookings`, `refund`). |
| **Paramètres** (`/admin/settings`) | Réglages de la plateforme stockés localement (UI). |

---

## 6. Fonctionnalités transverses

### 6.1 Thème clair / sombre
- Design tokens CSS (`--so-*`) : couleurs de marque (bleu **brand-blue**, terracotta **brand-terracotta**), surfaces, encres, bordures ; palette neutre + sémantique (succès/avertissement/erreur/info).
- Mode sombre complet via classe `.dark` ; bascule instantanée (`ThemeToggle`) présente dans le header public et la navigation.
- Préférence persistée dans `localStorage` (clé **`so_theme`**) ; **script anti-flash** inline dans `index.html` pour appliquer le thème avant le premier rendu (respecte aussi `prefers-color-scheme`).
- Corrections de contraste spécifiques (textes accents en foncé → éclaircis en mode sombre).

### 6.2 PWA (installable + hors-ligne)
- Manifest complet (`name`, `lang: fr`, `theme_color #2563eb`, `display: standalone`, icônes `any` + `maskable`, **shortcuts** « Mes cours / Quiz / Mentors »).
- Service worker Workbox (`generateSW`) : pré-cache des assets (JS/CSS/images/templates), **`navigateFallback`** pour le routage SPA hors-ligne, routage `/api/*` exclu.
- Icônes dérivées du logo (`pwa-192/512`, maskable, apple-touch 180).
- `PwaSupport` : bannière **« Installer SCHOOL ON »** (déclencheur natif), bannière **« Nouvelle version disponible »** (rechargement), bannière **« Prêt hors-ligne »** ; masquée si déjà installée (standalone).
- Métas iOS (`apple-mobile-web-app-*`), OG tags, `apple-touch-icon`.

### 6.3 UI / expérience
- **États** systématiques : chargement (skeletons/spinners), vide (illustration + message d'action), erreur (message + réessayer) — `components/ui/States.jsx`.
- **Notifications toast** : succès, erreur, informations (`Toast` + `ToastProvider`).
- **Modales / tabs / badges / cartes / boutons** réutilisables ; icônes **uniquement SVG** (lucide), aucun emoji dans l'UI.
- Règles de style appliquées : rayons généreux (~60 % sur les éléments carrés → `rounded-full`), logos de marque volontairement non arrondis ; design système via tokens.

### 6.4 Connexion backend & sécurité
- Base URL : `VITE_API_URL` (sinon `/`) ; en dev le proxy Vite `/api → http://localhost:8000`.
- **JWT** : tokens conservés en `localStorage` (`so_access`, `so_refresh`) ; interceptor ajoute le `Bearer` ; sur `401` → **refresh automatique** (`auth/token/refresh/`) avec mise en file des requêtes ; échec → déconnexion propre + redirection `/login`.
- Traduction des erreurs API en français (`getError`, libellés de champs).
- Toutes les requêtes d'écriture passent par des services dédiés (cf. §7).
- L'interface **ne produit aucun certificat ni résultat de quiz côté client** : certificats et notes sont toujours reçus du serveur.

### 6.5 Multi-langues (i18n)
- Langues supportées : **français (fr)**, **anglais (en)**, **kinyarwanda (rn)**, **swahili (sw)** — ajoutables en un fichier chacun dans `src/locales/<code>/translation.json`.
- Sélecteur de langue (`LanguageSwitcher`) disponible dans le header public, l'écran d'authentification (panneau + mobile) et la barre de navigation des espaces connectés.
- Détection + persistance : `so_lang` (localStorage), repli sur la langue du navigateur, défaut `fr` ; la clé manquante retombe toujours sur le français (pas d'écran cassé).
- Mise à jour automatique de l'attribut `<html lang>` ; initialisation avant le premier rendu (`src/i18n/index.js`, importé dans `main.jsx`).
- Portée actuelle (étape en cours) : navigation (tous rôles), header/footer public, accueil, parcours d'authentification complet (connexion, inscription, mot de passe, choix de parcours), bannières PWA, composants communs (champs, états, thème). L'infrastructure est prête pour étendre aux espaces apprenant/mentor/admin.

---

## 7. Connecteurs API (services)

| Service | Principaux appels |
|---|---|
| `auth.service.js` | `auth/login`, `auth/register`, `auth/change-password`, `auth/password-reset-request`, `auth/password-reset-confirm`, `users/logout-all`, `users/me` |
| `profile.service.js` | `profile/me`, `profile/avatar` (upload), `profile/location`, `profile/tutor`, `users/me/location`, `users/nearby-tutors` (rayon + coordonnées) |
| `courses.service.js` | `courses/categories`, `courses/courses` (+ CRUD), détail, `my_courses`, `enroll`, `lessons`, `mark_completed`, `quizzes` (+ `start`/`submit/`), `exams`/`learner-questions` |
| `payments.service.js` | `payments` (CRUD, détail), `payments/bookings`, `payments/:id/refund` |
| `extras.service.js` | `certificates` (+ `verify/:id`), `community/threads` (+ détail, création, `replies`) |
| `users` (divers) | `users`, `users/me/fcm-token`, `users/parent-child/request` & `respond` |

Comportement de repli : si le backend est indisponible, les services renvoient une erreur
filtrée (gracieuse) et les pages affichent leurs **états vides**, jamais de crash.

---

## 8. Build, préview et déploiement

```bash
npm install          # installer les dépendances
npm run dev          # serveur de dev (http://localhost:5173) + proxy /api
npm run build        # build de production + génération PWA (sw.js, manifest)
npm run preview      # test de la build sur http://localhost:4173 (PWA active)
```

- Sortie de build : `dist/` avec `sw.js`, `workbox-*.js`, `manifest.webmanifest`, icônes `pwa-*`.
- L'installation PWA (bouton natif) n'est proposée qu'en **HTTPS** (local : `localhost`).
  Pour tester la PWA, utiliser `npm run preview`, pas le serveur de dev.
- Scripts utilitaires : `scripts/theme-sweep.mjs` et `scripts/radius-sweep.mjs`
  (migration des classes), `scripts/gen-icons.mjs` / `gen-maskable.mjs` (régénération des icônes PWA depuis `public/logo-mark.png`).

---

## 9. Limites / à noter

- En cours d'i18n : les **espaces connectés** (pages apprenant / mentor / admin) affichent encore leurs textes en français (repli `fr`) — l'infra multi-langues est en place et le sélecteur fonctionne partout.
- La liste des **notifications** et les **paramètres admin** reposent pour l'instant sur de la
  donnée locale d'affichage (pas de persistance dédiée).
- Les **shortcuts PWA** pointent vers des routes de l'espace apprenant (reprennent la
  navigation après connexion).
- La **géolocalisation** pour « mentors proches » nécessite l'accord de localisation du
  navigateur (et un backend ayant des coordinateurs à proximité).
- En mode sombre, les **dégradés** et éléments accent ont été calibrés pour rester lisibles ;
  ne pas réintroduire le `hover:bg-brand-*-dark` sur les boutons (décision de design).