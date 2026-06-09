
# Refonte Voix du Vivant Afrique

Objectif : ouvrir le site au public, ne garder qu'un seul rôle Admin, simplifier la base de code, et donner une direction artistique éditoriale chaleureuse, asymétrique, « faite main ».

---

## Étape 1 — Auth, routes & rôles

**Routes (`src/App.tsx`)**
- Retirer `AuthGuard` global. Toutes les pages deviennent publiques : `/`, `/articles`, `/podcasts`, `/article/:slug`, `/podcast/:slug`, `/profile`.
- Conserver `/auth` (login admin uniquement).
- Garder `/admin/*` derrière un nouveau garde `AdminGuard`.
- Supprimer toutes les routes `/editor/*`.

**Rôles**
- Supprimer la notion de rôle « editor » et « user » côté client.
- `useAuth` n'expose plus que `user`, `session`, `loading`, `isAdmin`, `signOut`.
- `isAdmin` = `has_role(uid, 'admin')` (on conserve l'enum mais on ne crée plus que des admins).

**Fichiers supprimés**
- `src/pages/Editor.tsx`, `EditorDashboard.tsx`, `EditorArticles.tsx`, `EditorArticleForm.tsx`, `EditorPodcasts.tsx`, `EditorPodcastForm.tsx`
- `src/pages/AdminEditors.tsx`, `AdminApplications.tsx`
- `src/components/CreatorApplicationForm.tsx`, `BecomeCreatorSection.tsx`
- `src/components/AuthGuard.tsx` (remplacé par `AdminGuard.tsx`)
- `supabase/functions/create-editor/` (edge function)

**Création**
- `src/components/AdminGuard.tsx` : redirige vers `/auth` si non connecté, vers `/` si connecté non-admin.
- Le menu Admin perd les entrées « Éditeurs », « Candidatures ». Les articles/podcasts sont créés/édités directement dans `/admin/articles` et `/admin/podcasts` (formulaires intégrés réutilisant les composants existants `EditorArticleForm` renommés en `AdminArticleForm`).

---

## Étape 2 — Base de données (migration)

- DROP des tables `creator_applications` et de tous leurs objets liés.
- Nettoyer `user_roles` : conserver l'enum mais documenter qu'on n'utilise plus que `'admin'`.
- **Réécrire les RLS** pour lecture publique :
  - `articles`, `podcasts` : `SELECT` autorisé à `anon` + `authenticated` quand `published = true`. Écriture réservée à `has_role(uid,'admin')`.
  - `comments` : `SELECT` public (commentaires approuvés), `INSERT` public modéré, modération admin.
  - `article_ratings`, `podcast_ratings`, `article_views`, `podcast_views`, `bookmarks` : `INSERT` anonyme autorisé (avec `user_id` nullable pour ratings/bookmarks → on garde l'exigence d'auth uniquement pour bookmarks).
- Ajouter les `GRANT SELECT ... TO anon` correspondants.

> Note : la migration sera proposée à la validation utilisateur lors de l'implémentation.

---

## Étape 3 — Import de documents robuste

`src/components/DocumentImport.tsx` :
- Upload du fichier brut (.pdf / .docx) dans un nouveau bucket public `article-documents` (créé via tool).
- Extraction texte via `mammoth` (docx) et `pdfjs-dist` (pdf) côté client comme aujourd'hui.
- Sauvegarde dans `articles` :
  - `content` = HTML extrait (sanitisé)
  - nouvelle colonne `source_document_url` (text, nullable) → URL publique du document brut, exposée en lecture seule sur la page article (« Télécharger la source »).

---

## Étape 4 — Refonte visuelle « human-made »

**Design tokens (`src/index.css`, `tailwind.config.ts`)**
- Palette terre/forêt : ivoire savane, terre de sienne, vert forêt profond, ocre, ébène. Tokens HSL sémantiques (`--background`, `--primary`, `--accent`, `--ink`, `--paper`).
- Ajout d'ombres organiques (`--shadow-leaf`), grain subtil sur fonds (`background-image: url(noise.svg)` à très faible opacité).
- Rayons asymétriques : utilitaires Tailwind `rounded-leaf` (`border-radius: 2rem 0.5rem 2rem 0.5rem`) et `rounded-pebble`.

**Typographie**
- Titres : `Fraunces` (serif chaleureux, expressif) ou `DM Serif Display`.
- Corps : `Inter` conservée mais avec `font-feature-settings` pour ligatures.
- Hiérarchie éditoriale stricte (H1 très grand, lettrines optionnelles sur articles).

**Layouts**
- Homepage : grille magazine asymétrique (1 article hero pleine largeur + 2 cartes moyennes + 3 cartes compactes). Décalages verticaux légers.
- `Articles.tsx` : alternance taille de carte, séparateurs typographiques.
- Cartes : coins opposés arrondis, image légèrement décalée du cadre (overlap).

**Micro-interactions**
- Transitions de pages via `framer-motion` (`AnimatePresence` + fade/slide léger).
- Hover cartes : translation 2px + ombre douce + révélation d'un trait.
- Respect `prefers-reduced-motion` (hook existant).

**Lecteur audio persistant**
- Nouveau composant `src/components/PersistentAudioPlayer.tsx` + contexte `AudioPlayerContext`.
- Barre flottante en bas (`fixed bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:w-96`), arrondis organiques, contrôles play/pause, seek, fermer.
- Déclenché depuis `PodcastView` et `PodcastSection` (bouton « Écouter »).

**Navbar**
- Logo aligné gauche, liens centrés avec underline animé, CTA discret « Espace admin » uniquement si `isAdmin`.

---

## Étape 5 — Nettoyage final
- Retirer imports morts, mises à jour `Footer` (suppression du lien « Devenir créateur »).
- Mise à jour `docs/TECHNICAL.md` pour refléter la nouvelle architecture (1 rôle admin, routes publiques, lecteur persistant).
- Vérification build + parcours rapide preview.

---

## Détails techniques

```text
src/
├── App.tsx                       (routes publiques + /admin protégé)
├── components/
│   ├── AdminGuard.tsx            (nouveau)
│   ├── PersistentAudioPlayer.tsx (nouveau)
│   ├── layout/MagazineGrid.tsx   (nouveau, grille asymétrique)
│   └── ...
├── contexts/AudioPlayerContext.tsx (nouveau)
├── hooks/useAuth.tsx             (simplifié: isAdmin seul)
└── pages/                        (suppression Editor*, AdminEditors, AdminApplications)
```

Migrations Supabase à proposer :
1. `drop_creator_applications_and_editor_role_cleanup`
2. `public_read_rls_articles_podcasts_comments`
3. `add_source_document_url_to_articles`

Bucket à créer via tool : `article-documents` (public).

Dépendance à ajouter : `framer-motion` (déjà présente — à vérifier au build).

---

## Hors scope
- Pas de changement du provider d'auth (email/password conservé pour l'admin).
- Pas de refonte des emails transactionnels.
- Pas de migration des données existantes (les comptes editor existants deviennent simplement des utilisateurs sans accès admin).
