# 📘 Documentation Technique - Voix du Vivant Afrique

## Table des matières

1. [Architecture Générale](#architecture-générale)
2. [Structure du Projet](#structure-du-projet)
3. [Base de Données](#base-de-données)
4. [Authentification & Autorisation](#authentification--autorisation)
5. [Composants Clés](#composants-clés)
6. [Edge Functions](#edge-functions)
7. [Design System](#design-system)
8. [API & Intégrations](#api--intégrations)
9. [Déploiement](#déploiement)

---

## Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    LOVABLE CLOUD (Supabase)                  │
├─────────────────┬─────────────────┬─────────────────────────┤
│   PostgreSQL    │    Storage      │    Edge Functions       │
│   (Database)    │  (Files/Media)  │   (Serverless Logic)    │
├─────────────────┴─────────────────┴─────────────────────────┤
│                    Supabase Auth                             │
└─────────────────────────────────────────────────────────────┘
```

### Stack Technique Détaillée

| Couche | Technologies |
|--------|-------------|
| **UI Framework** | React 18.3.1 |
| **Langage** | TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + tailwindcss-animate |
| **Composants UI** | shadcn/ui (Radix UI primitives) |
| **Routing** | React Router DOM 6.x |
| **State Management** | TanStack Query (React Query) |
| **Forms** | React Hook Form + Zod |
| **Éditeur Riche** | TipTap |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Animations** | Tailwind + CSS Transitions |

---

## Structure du Projet

```
voix-du-vivant-afrique/
├── public/                    # Fichiers statiques publics
│   └── robots.txt
├── src/
│   ├── assets/                # Images et médias
│   │   ├── hero-savanna.jpg
│   │   ├── pangolin.jpg
│   │   ├── conservationist.jpg
│   │   ├── baobab-tradition.jpg
│   │   └── logo.jpg
│   │
│   ├── components/            # Composants React
│   │   ├── ui/                # Composants shadcn/ui (40+ composants)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   │
│   │   ├── Header.tsx         # Navigation principale
│   │   ├── Footer.tsx         # Pied de page
│   │   ├── Hero.tsx           # Section héro page d'accueil
│   │   ├── ArticleCard.tsx    # Carte d'article
│   │   ├── ArticleView.tsx    # Vue détaillée article
│   │   ├── PodcastSection.tsx # Section podcasts
│   │   ├── PodcastView.tsx    # Vue détaillée podcast
│   │   ├── RubriqueCard.tsx   # Carte de rubrique
│   │   ├── AboutSection.tsx   # Section "À propos"
│   │   ├── SupportSection.tsx # Section dons
│   │   ├── BecomeCreatorSection.tsx
│   │   ├── PartnerBanner.tsx
│   │   ├── CommentsSection.tsx # Commentaires
│   │   ├── RatingStars.tsx    # Système de notation
│   │   └── RichTextEditor.tsx # Éditeur TipTap
│   │
│   ├── hooks/                 # Hooks personnalisés
│   │   ├── useAuth.tsx        # Authentification & rôles
│   │   ├── useTrackView.tsx   # Tracking des vues
│   │   ├── usePendingContentNotifications.tsx
│   │   ├── use-mobile.tsx     # Détection mobile
│   │   └── use-toast.ts       # Notifications toast
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts      # Client Supabase (auto-généré)
│   │       └── types.ts       # Types TypeScript (auto-généré)
│   │
│   ├── lib/
│   │   └── utils.ts           # Utilitaires (cn, etc.)
│   │
│   ├── pages/                 # Pages de l'application
│   │   ├── Index.tsx          # Page d'accueil
│   │   ├── Articles.tsx       # Liste des articles
│   │   ├── Podcasts.tsx       # Liste des podcasts
│   │   ├── Auth.tsx           # Connexion/Inscription
│   │   ├── Profile.tsx        # Profil utilisateur
│   │   ├── NotFound.tsx       # Page 404
│   │   │
│   │   ├── Admin.tsx          # Layout administration
│   │   ├── AdminDashboard.tsx # Tableau de bord admin
│   │   ├── AdminArticles.tsx  # Gestion articles
│   │   ├── AdminPodcasts.tsx  # Gestion podcasts
│   │   ├── AdminComments.tsx  # Modération commentaires
│   │   ├── AdminEditors.tsx   # Gestion éditeurs
│   │   ├── AdminModeration.tsx# Modération globale
│   │   ├── AdminUsers.tsx     # Gestion utilisateurs
│   │   │
│   │   ├── Editor.tsx         # Layout éditeur
│   │   ├── EditorDashboard.tsx# Tableau de bord éditeur
│   │   ├── EditorArticles.tsx # Articles de l'éditeur
│   │   └── EditorPodcasts.tsx # Podcasts de l'éditeur
│   │
│   ├── App.tsx                # Composant racine + Routes
│   ├── App.css                # Styles additionnels
│   ├── main.tsx               # Point d'entrée
│   ├── index.css              # Design system + variables CSS
│   └── vite-env.d.ts          # Types Vite
│
├── supabase/
│   ├── config.toml            # Configuration Supabase
│   ├── functions/             # Edge Functions
│   │   └── create-editor/
│   │       └── index.ts       # Création de comptes éditeur
│   └── migrations/            # Migrations SQL (auto-gérées)
│
├── docs/
│   └── TECHNICAL.md           # Cette documentation
│
├── index.html                 # Template HTML
├── tailwind.config.ts         # Configuration Tailwind
├── vite.config.ts             # Configuration Vite
├── tsconfig.json              # Configuration TypeScript
└── package.json               # Dépendances
```

---

## Base de Données

### Schéma des Tables

#### `profiles`
Informations des profils utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `user_id` | uuid | Référence auth.users |
| `full_name` | text | Nom complet |
| `avatar_url` | text | URL de l'avatar |
| `created_at` | timestamptz | Date de création |
| `updated_at` | timestamptz | Date de mise à jour |

#### `user_roles`
Système de rôles (séparé pour la sécurité).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `user_id` | uuid | Référence utilisateur |
| `role` | app_role | Enum: 'admin', 'editor', 'user' |
| `created_at` | timestamptz | Date d'attribution |

#### `articles`
Contenus articles du blog.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `author_id` | uuid | Auteur de l'article |
| `title` | text | Titre |
| `slug` | text | URL-friendly identifier |
| `excerpt` | text | Extrait/résumé |
| `content` | text | Contenu HTML |
| `rubrique` | text | Catégorie thématique |
| `image_url` | text | Image de couverture |
| `published` | boolean | Statut de publication |
| `created_at` | timestamptz | Date de création |
| `updated_at` | timestamptz | Date de mise à jour |

#### `podcasts`
Épisodes de podcasts.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `author_id` | uuid | Auteur du podcast |
| `title` | text | Titre |
| `slug` | text | URL-friendly identifier |
| `description` | text | Description |
| `audio_url` | text | URL du fichier audio |
| `image_url` | text | Image de couverture |
| `duration` | integer | Durée en secondes |
| `published` | boolean | Statut de publication |
| `created_at` | timestamptz | Date de création |
| `updated_at` | timestamptz | Date de mise à jour |

#### `comments`
Commentaires sur articles et podcasts.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `user_id` | uuid | Auteur du commentaire |
| `article_id` | uuid | Article associé (nullable) |
| `podcast_id` | uuid | Podcast associé (nullable) |
| `content` | text | Contenu du commentaire |
| `approved` | boolean | Statut de modération |
| `created_at` | timestamptz | Date de création |
| `updated_at` | timestamptz | Date de mise à jour |

#### `article_ratings` / `podcast_ratings`
Système de notation par étoiles.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `article_id`/`podcast_id` | uuid | Contenu noté |
| `user_id` | uuid | Utilisateur (nullable) |
| `rating` | integer | Note (1-5) |
| `created_at` | timestamptz | Date de notation |

#### `article_views` / `podcast_views`
Tracking des vues pour statistiques.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `article_id`/`podcast_id` | uuid | Contenu vu |
| `user_id` | uuid | Utilisateur (nullable) |
| `ip_address` | text | Adresse IP |
| `user_agent` | text | User agent |
| `viewed_at` | timestamptz | Date de vue |

### Fonctions de Base de Données

```sql
-- Vérification de rôle (utilisée dans les politiques RLS)
has_role(_user_id uuid, _role app_role) → boolean

-- Gestion automatique des profils
handle_new_user() → trigger (crée un profil à l'inscription)

-- Mise à jour automatique des timestamps
update_updated_at_column() → trigger
```

### Politiques RLS (Row Level Security)

Toutes les tables ont RLS activé avec des politiques spécifiques :

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Tous | Propriétaire | Propriétaire | ❌ |
| `user_roles` | Authentifiés | Admins | Admins | Admins |
| `articles` | Publiés + Auteur + Admin | Éditeurs/Admins | Auteur/Admin | Admins |
| `podcasts` | Publiés + Auteur + Admin | Éditeurs/Admins | Auteur/Admin | Admins |
| `comments` | Approuvés + Auteur + Admin | Authentifiés | Auteur (non approuvé) | Admins |
| `*_ratings` | Tous | Authentifiés | Propriétaire | ❌ |
| `*_views` | Admins | Tous | ❌ | ❌ |

---

## Authentification & Autorisation

### Hook `useAuth`

```typescript
const { 
  user,          // Utilisateur connecté
  loading,       // État de chargement
  isAdmin,       // Est administrateur
  isEditor,      // Est éditeur
  signIn,        // Connexion
  signUp,        // Inscription
  signOut,       // Déconnexion
} = useAuth();
```

### Flux d'Authentification

```
1. Utilisateur s'inscrit (email + mot de passe)
           ↓
2. Supabase Auth crée l'utilisateur
           ↓
3. Trigger `handle_new_user` crée le profil
           ↓
4. Utilisateur connecté avec rôle "user" par défaut
           ↓
5. Admin peut attribuer rôle "editor" via Edge Function
```

### Protection des Routes

```typescript
// Dans les pages protégées
if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/auth" />;
if (!isAdmin) return <Navigate to="/" />;
```

---

## Composants Clés

### `RichTextEditor`
Éditeur de texte riche basé sur TipTap.

**Fonctionnalités :**
- Formatage (gras, italique, souligné)
- Titres (H1-H3)
- Listes (ordonnées, non ordonnées)
- Liens
- Images
- Citations

```typescript
<RichTextEditor
  content={content}
  onChange={setContent}
  placeholder="Rédigez votre article..."
/>
```

### `RatingStars`
Système de notation interactif.

```typescript
<RatingStars
  contentId={articleId}
  contentType="article" // ou "podcast"
/>
```

### `CommentsSection`
Gestion des commentaires avec modération.

```typescript
<CommentsSection
  contentId={articleId}
  contentType="article"
/>
```

---

## Edge Functions

### `create-editor`
Crée un compte éditeur (réservé aux admins).

**Endpoint :** `POST /functions/v1/create-editor`

**Headers requis :**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body :**
```json
{
  "email": "editeur@example.com",
  "password": "motdepasse123",
  "full_name": "Nom de l'éditeur"
}
```

**Réponse :**
```json
{
  "success": true,
  "user": { "id": "uuid", "email": "..." }
}
```

---

## Design System

### Variables CSS (index.css)

```css
:root {
  --background: 45 30% 98%;
  --foreground: 45 10% 10%;
  --primary: 142 45% 35%;      /* Vert nature */
  --secondary: 45 60% 50%;     /* Ocre savane */
  --accent: 25 75% 50%;        /* Orange coucher de soleil */
  --muted: 45 15% 90%;
  --destructive: 0 72% 51%;
  /* ... */
}

.dark {
  --background: 45 10% 10%;
  --foreground: 45 10% 95%;
  /* ... */
}
```

### Classes Utilitaires Personnalisées

```css
.gradient-hero        /* Dégradé pour section héro */
.shadow-elevated      /* Ombre portée élégante */
.transition-smooth    /* Transition fluide */
.animate-fade-in      /* Animation d'apparition */
```

### Composants shadcn/ui Utilisés

- `Button`, `Card`, `Dialog`, `Input`, `Label`
- `Select`, `Tabs`, `Toast`, `Tooltip`
- `Avatar`, `Badge`, `Skeleton`
- `Table`, `Form`, `ScrollArea`
- Et 30+ autres...

---

## API & Intégrations

### Client Supabase

```typescript
import { supabase } from "@/integrations/supabase/client";

// Requête simple
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('published', true);

// Appel Edge Function
const { data, error } = await supabase.functions.invoke('create-editor', {
  body: { email, password, full_name }
});
```

### Stockage (Buckets)

| Bucket | Public | Usage |
|--------|--------|-------|
| `article-images` | ✅ | Images d'articles |
| `podcast-audio` | ✅ | Fichiers audio |

---

## Déploiement

### Variables d'Environnement

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxx
```

### Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

### Publication

1. **Frontend** : Cliquer sur "Publish" → "Update" dans Lovable
2. **Backend** : Les Edge Functions se déploient automatiquement

---

## Maintenance

### Logs & Debugging

- **Console logs** : Disponibles dans les outils développeur
- **Edge Function logs** : Accessibles via Lovable Cloud
- **Database logs** : Requêtes analytics Supabase

### Mises à jour

1. Les dépendances sont gérées via `package.json`
2. Les migrations DB sont versionnées dans `supabase/migrations/`
3. Les types Supabase sont auto-générés

---

*Documentation générée le 5 décembre 2024*
