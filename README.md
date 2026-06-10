# Voix du Vivant Afrique

> **Média en ligne dédié à la biodiversité africaine.**  
> Découvrir, Comprendre et Protéger la richesse naturelle du continent africain.

---

## 🌍 À propos

**Voix du Vivant Afrique** est une plateforme de vulgarisation scientifique et environnementale focalisée sur la faune, la flore et la conservation en Afrique. Elle propose des articles éditoriaux, des podcasts immersifs et une bibliothèque de ressources documentaires.

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| **Framework** | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| **Bundler** | [Vite 5](https://vitejs.dev) (SWC) |
| **Styles** | [Tailwind CSS 3](https://tailwindcss.com) + CSS custom properties |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) (Radix Primitives) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) + Canvas API |
| **Base de données** | [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage, RLS) |
| **Data Fetching** | [TanStack React Query](https://tanstack.com/query) |
| **Routing** | [React Router DOM v6](https://reactrouter.com) |
| **Rich Text** | [Tiptap](https://tiptap.dev) (Editor admin) |
| **Sanitization** | [DOMPurify](https://github.com/cure53/DOMPurify) |

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (ou pnpm / yarn)
- Un projet [Supabase](https://supabase.com) avec les tables et fonctions RPC configurées

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/Strawhat0-3/Voix-du-vivant.git
cd Voix-du-vivant

# Installer les dépendances
npm install
```

### Configuration

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL="https://votre-projet.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | URL de votre instance Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique anonyme (anon key) de Supabase |

### Lancer le serveur de développement

```bash
npm run dev
```

L'application démarre sur `http://localhost:8080`.

### Build de production

```bash
npm run build
npm run preview   # Prévisualiser le build
```

## 📁 Structure du projet

```
src/
├── components/       # Composants React (UI, layout, features)
│   ├── ui/           # Primitives shadcn/ui (Button, Card, Dialog…)
│   ├── MagazineHero.tsx
│   ├── EditorialGrid.tsx
│   ├── SuperSearch.tsx
│   ├── ClapButton.tsx
│   └── ...
├── pages/            # Pages routées (Index, Articles, Podcasts, Admin…)
├── hooks/            # Custom hooks (useAuth, useDebounce, useTrackView…)
├── contexts/         # React Contexts (AudioPlayer…)
├── integrations/     # Supabase client & types auto-générés
├── lib/              # Utilitaires (sanitize, cn…)
├── assets/           # Images statiques
└── index.css         # Design system (variables, utilitaires, animations)
```

## 🎨 Design

Le design suit une esthétique **Afro-Minimaliste** — typographie Serif dramatique (Fraunces, Playfair Display), palette terrestre (ocre, sienna, forêt), et effets premium :

- **Canvas magnétique** — Particules interactives en arrière-plan
- **Grain de film** — Texture SVG fractal en overlay
- **Curseur custom** — Orbe ocre avec spring physics (Framer Motion)
- **Smooth scroll** — Animations de sections au défilement

## 🔐 Sécurité

- Toutes les requêtes publiques filtrent `.eq("published", true)`
- Commentaires soumis avec `approved: false` (modération admin)
- Sanitization HTML via DOMPurify sur tout le contenu rendu
- Row Level Security (RLS) activé sur toutes les tables Supabase
- Zone admin protégée par `AdminGuard` (vérification rôle)

## 📦 Déploiement

Compatible avec tout hébergeur de sites statiques :

- **[Vercel](https://vercel.com)** — `npm run build` → déploiement auto
- **[Netlify](https://netlify.com)** — Build command: `npm run build`, publish: `dist`
- **[Cloudflare Pages](https://pages.cloudflare.com)** — Idem

> ⚠️ N'oubliez pas de configurer les variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) dans le dashboard de votre hébergeur.

## 📝 Licence

Projet privé — Tous droits réservés © Voix du Vivant Afrique.
