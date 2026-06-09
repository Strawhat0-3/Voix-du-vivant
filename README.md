# 🌍 Voix du Vivant Afrique

> Découvrir, Comprendre et Protéger la biodiversité africaine

**URL du projet**: https://lovable.dev/projects/9766ef03-dce2-4a64-b4e2-3bef6270c003

---

## 📖 Présentation

**Voix du Vivant Afrique** est une plateforme web de média en ligne dédiée à la découverte, la compréhension et la protection de la biodiversité africaine. C'est un site éditorial combinant articles, podcasts et contenus multimédias pour sensibiliser le public aux enjeux environnementaux du continent africain.

---

## ✨ Fonctionnalités

### 🏠 Interface Publique
- **Page d'accueil** immersive avec section héro présentant la mission
- **Catalogue d'articles** organisés par rubriques thématiques
- **Section podcasts** pour des récits audio immersifs
- **Système de notation** par étoiles (1-5) pour articles et podcasts
- **Commentaires** modérés sur les contenus
- **Section "Soutenez-nous"** pour les dons externes
- **Section "Devenir créateur"** pour rejoindre l'équipe

### 📚 Rubriques Thématiques
| Rubrique | Description |
|----------|-------------|
| 🌿 Espèces à la loupe | Portraits détaillés de la faune et flore africaine |
| 🧠 Comprendre l'environnement | Enjeux écologiques : climat, déforestation, biodiversité |
| 👥 Acteurs du vivant | Rencontres avec scientifiques, militants, communautés |
| 🌳 Traditions & Nature | Savoirs ancestraux et préservation environnementale |
| 🎧 Podcasts & Audio | Récits sonores immersifs |
| 📍 Initiatives locales | Projets environnementaux inspirants |
| 🎓 Jeunesse & Pédagogie | Contenus éducatifs pour les jeunes |
| 📖 Ressources | Guides pratiques et fiches pédagogiques |

### ✏️ Espace Éditeur (`/editor`)
- Tableau de bord avec statistiques personnelles
- Création et édition d'articles avec éditeur riche
- Gestion des podcasts (upload audio, descriptions)
- Soumission de contenu pour validation

### 👑 Espace Administration (`/admin`)
- Tableau de bord avec statistiques globales
- Modération des contenus (validation/rejet)
- Gestion des comptes éditeurs (création, modification, suppression)
- Modération des commentaires
- Gestion des utilisateurs

---

## 🔐 Système de Rôles

| Rôle | Permissions |
|------|-------------|
| **Utilisateur** | Lecture, commentaires, notation |
| **Éditeur** | Création de contenu, soumission pour validation |
| **Administrateur** | Accès complet, publication, modération, gestion des éditeurs |

---

## 🛠️ Stack Technique

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS + shadcn/ui
- **Backend** : Lovable Cloud (Supabase)
- **Base de données** : PostgreSQL
- **Stockage** : Supabase Storage (images, audio)
- **Authentification** : Supabase Auth

---

## 📁 Structure du Projet

```
src/
├── assets/              # Images et ressources statiques
├── components/          # Composants React réutilisables
│   ├── ui/              # Composants UI (shadcn)
│   └── ...              # Composants métier
├── hooks/               # Hooks personnalisés
├── integrations/        # Intégrations (Supabase)
├── lib/                 # Utilitaires
├── pages/               # Pages de l'application
│   ├── Admin*.tsx       # Pages administration
│   ├── Editor*.tsx      # Pages éditeur
│   └── ...              # Pages publiques
└── index.css            # Styles globaux et design system

supabase/
├── functions/           # Edge Functions
└── migrations/          # Migrations SQL

docs/
└── TECHNICAL.md         # Documentation technique détaillée
```

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js & npm installés - [installer avec nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Cloner le repository
git clone <YOUR_GIT_URL>

# Naviguer dans le dossier
cd <YOUR_PROJECT_NAME>

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

### Autres commandes

```sh
npm run build      # Build production
npm run preview    # Preview du build
npm run lint       # Vérification du code
```

---

## 📊 Base de Données

### Tables Principales
- `articles` - Articles du blog
- `podcasts` - Épisodes de podcasts
- `comments` - Commentaires des utilisateurs
- `profiles` - Profils utilisateurs
- `user_roles` - Rôles et permissions
- `article_views` / `podcast_views` - Statistiques de vues
- `article_ratings` / `podcast_ratings` - Notations

📘 Voir [docs/TECHNICAL.md](docs/TECHNICAL.md) pour le schéma complet.

---

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Authentification requise pour les actions sensibles
- Rôles séparés dans une table dédiée (prévention des escalades de privilèges)
- Validation des entrées côté client et serveur

---

## 📝 Workflow Éditorial

```
Éditeur crée un contenu (non publié)
        ↓
Admin voit le contenu en attente
        ↓
Admin valide et publie
        ↓
Contenu visible publiquement
        ↓
Utilisateurs commentent (modération)
```

---

## 🚢 Déploiement

### Via Lovable
Ouvrir [Lovable](https://lovable.dev/projects/9766ef03-dce2-4a64-b4e2-3bef6270c003) → Share → Publish

### Domaine personnalisé
Project → Settings → Domains → Connect Domain

📖 [Documentation domaine personnalisé](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 📖 Documentation

- [Documentation Technique Complète](docs/TECHNICAL.md)
- [Documentation Lovable](https://docs.lovable.dev)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir la section "Devenir créateur" sur le site.

---

## 📄 Licence

Tous droits réservés © Voix du Vivant Afrique

---

*Ensemble, faisons entendre la voix du vivant et préservons la richesse de notre continent pour les générations futures.* 🌿
