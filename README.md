# SCHOOL ON Frontend

Frontend React/Vite de SCHOOL ON, une plateforme de cours, quiz, mentors, communauté, paiements et certificats.

## Stack

- React 19
- Vite 8
- React Router
- Axios
- Tailwind CSS
- PWA

## Installation locale

```bash
npm ci
cp .env.example .env
npm run dev
```

Sous PowerShell :

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

Frontend local : `http://localhost:5173`

## Variables d'environnement

```env
VITE_API_URL=http://localhost:8000/api/
VITE_PROXY_TARGET=http://localhost:8000
```

En production, `VITE_API_URL` doit pointer vers l’API Django publique :

```env
VITE_API_URL=https://api.example.com/api/
```

Ne mettez aucune clé secrète dans les variables `VITE_*`.

## Fonctionnalités

- Authentification JWT et rafraîchissement automatique
- Espaces apprenant, mentor et administrateur
- Catalogue de cours et création de cours mentor
- Chapitres, leçons et quiz
- Mentors et réservations
- Communauté et catégories
- Paiements Blink/Bitlibera
- Certificats vérifiables

## Build

```bash
npm run build
npm run preview
```

## Déploiement Vercel

- Root Directory : `Project_School_On_v1`
- Install Command : `npm ci`
- Build Command : `npm run build`
- Output Directory : `dist`
- Variable obligatoire : `VITE_API_URL=https://api.example.com/api/`

Le fichier `vercel.json` configure le fallback SPA vers `index.html`, ce qui permet l’accès direct aux routes React comme `/dashboard` ou `/mentor/courses`.

## Connexion avec Django

Le backend doit autoriser l’origine du frontend dans `CORS_ALLOWED_ORIGINS`. Les appels frontend utilisent les services présents dans `src/services/` et le client Axios de `src/services/api.js`.
