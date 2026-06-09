# Charte Graphique - Voix du Vivant Afrique (V3)

## Philosophie du Design

**Direction esthétique : Éditorial Luxueux Africain**

Un design qui évoque les grands magazines nature et les éditions de prestige, mêlant l'authenticité de la terre africaine à une élégance contemporaine. L'approche privilégie les contrastes dramatiques, les textures organiques et une typographie expressive.

---

## 🎨 Palette de Couleurs

### Couleurs Principales

| Nom | Variable | HSL | Hex | Usage |
|-----|----------|-----|-----|-------|
| **Ivoire Savane** | `--background` | 42 40% 96% | #F8F5EE | Fond principal (papier naturel) |
| **Ébène** | `--foreground` | 30 20% 12% | #231F1B | Texte principal |
| **Terre de Sienne** | `--primary` | 24 65% 38% | #A05B28 | Navigation, titres, accents |
| **Forêt Équatoriale** | `--secondary` | 158 45% 28% | #27735A | Nature, succès, biodiversité |
| **Fleuve Congo** | `--water` | 200 55% 35% | #29718F | Citations, liens, éléments aquatiques |
| **Soleil Couchant** | `--highlight` | 18 90% 52% | #F35A1D | CTA principaux, dons, urgence |

### Couleurs de Surface

| Élément | Mode Clair | Mode Sombre |
|---------|------------|-------------|
| Background | 42 40% 96% (Ivoire) | 25 25% 8% (Nuit Profonde) |
| Card | 40 30% 99% (Crème) | 28 20% 12% (Charbon) |
| Muted | 38 25% 90% (Sable) | 25 20% 16% (Ardoise) |
| Border | 35 20% 82% (Argile) | 25 15% 22% (Ombre) |

### Couleurs de Texte

| Élément | Mode Clair | Mode Sombre |
|---------|------------|-------------|
| Foreground | 30 20% 12% (Ébène) | 40 25% 94% (Ivoire Clair) |
| Muted | 30 15% 45% (Pierre) | 35 12% 60% (Gris Chaud) |

---

## 🔤 Typographie

### Familles de Polices

```css
/* Titres - Élégance éditoriale magazine */
font-family: 'Playfair Display', Georgia, serif;

/* Corps - Lisibilité contemporaine */
font-family: 'Inter', system-ui, sans-serif;
```

### Échelle Typographique

| Élément | Police | Taille | Poids | Tracking | Usage |
|---------|--------|--------|-------|----------|-------|
| H1 (Hero) | Playfair | clamp(3rem, 8vw, 5rem) | 700 | -0.02em | Titre hero uniquement |
| H2 (Section) | Playfair | clamp(2rem, 5vw, 3rem) | 600 | -0.01em | Titres de sections |
| H3 (Card) | Playfair | 1.5rem | 600 | 0 | Titres d'articles/cartes |
| Lead | Inter | 1.25rem | 400 | 0.01em | Chapeau, introduction |
| Body | Inter | 1rem | 400 | 0 | Contenu standard |
| Caption | Inter | 0.875rem | 500 | 0.02em | Métadonnées, crédits |
| Overline | Inter | 0.75rem | 600 | 0.1em | Catégories, tags (UPPERCASE) |

### Règles Typographiques

- **Line-height** : 1.7 pour le corps de texte (lecture optimale)
- **Largeur max** : 70ch pour les paragraphes
- **Playfair** : Jamais sous 1.25rem
- **Contraste titres** : Utiliser le poids 600+ pour une hiérarchie claire

---

## 🌈 Dégradés & Effets

### Dégradés Signature

```css
/* Hero - Canopée */
--gradient-hero: linear-gradient(
  165deg, 
  hsl(158 45% 18% / 0.92) 0%, 
  hsl(158 40% 28% / 0.75) 60%,
  hsl(200 50% 30% / 0.6) 100%
);

/* Accent - Coucher de soleil africain */
--gradient-sunset: linear-gradient(
  135deg, 
  hsl(18 90% 52%) 0%, 
  hsl(35 85% 55%) 100%
);

/* Surface - Dune dorée */
--gradient-dune: linear-gradient(
  180deg, 
  hsl(42 40% 96%) 0%, 
  hsl(38 30% 90%) 100%
);

/* Eau - Fleuve profond */
--gradient-water: linear-gradient(
  135deg, 
  hsl(200 55% 30%) 0%, 
  hsl(185 45% 40%) 100%
);
```

### Ombres Organiques

```css
/* Naturelle - Repos */
--shadow-natural: 
  0 1px 2px hsl(30 25% 20% / 0.04),
  0 4px 12px hsl(30 25% 20% / 0.08);

/* Flottante - Hover */
--shadow-float: 
  0 4px 8px hsl(30 25% 20% / 0.06),
  0 12px 32px hsl(30 25% 20% / 0.12);

/* Élevée - Modales */
--shadow-elevated: 
  0 8px 16px hsl(30 25% 20% / 0.08),
  0 24px 48px hsl(30 25% 20% / 0.16);

/* Glow - CTA */
--shadow-glow: 0 8px 32px hsl(18 90% 52% / 0.35);
```

---

## 🧱 Texture & Matière

### Grain de Papier

Une texture de grain subtile rappelle le papier naturel et les magazines de qualité.

```css
.bg-grain::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,..."); /* Noise SVG */
  pointer-events: none;
  mix-blend-mode: multiply;
}
```

### Bordures Organiques

```css
/* Bordure fine mais visible */
--border-subtle: 1px solid hsl(35 20% 82% / 0.6);

/* Bordure accent sur hover */
--border-accent: 2px solid hsl(var(--primary));
```

---

## 💎 Iconographie

- **Librairie** : Lucide React
- **Stroke Width** : 1.5px (élégant et lisible)
- **Tailles** : 18px (sm), 22px (md), 28px (lg)
- **Style** : Traits fins, formes arrondies

---

## 🧩 Composants UI

### Boutons

| Variante | Background | Texte | Usage |
|----------|------------|-------|-------|
| **Highlight (CTA)** | `--highlight` + glow | Blanc | Dons, Actions prioritaires |
| **Primary** | `--primary` | Blanc | Lire, Connexion, Valider |
| **Secondary** | `--secondary` | Blanc | Nature, Succès |
| **Water** | `--water` | Blanc | Liens, Podcasts |
| **Outline** | Transparent | `--primary` | Filtres, Options secondaires |
| **Ghost** | Transparent | `--foreground` | Navigation, Menus |

### Cartes

- **Arrondi** : 16px (lg) ou 12px (md)
- **Ombre repos** : `--shadow-natural`
- **Ombre hover** : `--shadow-float` + translateY(-6px)
- **Image zoom** : scale(1.05) au hover
- **Transition** : 400ms cubic-bezier(0.4, 0, 0.2, 1)

### Tags/Badges

- **Fond** : `--primary` avec opacity 0.1
- **Texte** : `--primary`
- **Padding** : 4px 12px
- **Border-radius** : 9999px (pill)
- **Font** : Overline style (uppercase, tracking large)

---

## ✨ Animations

### Transitions Globales

```css
--transition-fast: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 400ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 600ms cubic-bezier(0.16, 1, 0.3, 1);
```

### Effets d'Entrée

- **Fade In Up** : opacity 0→1, translateY(20px→0), 500ms
- **Scale In** : scale(0.95→1), opacity 0→1, 300ms
- **Slide In** : translateX(-100%→0), 400ms

### Micro-interactions

- **Hover lift** : translateY(-6px) + shadow-float
- **Link underline** : Ligne animée de gauche à droite
- **Button press** : scale(0.98) + légère translation

---

## ♿ Accessibilité

- **Contraste minimum** : 4.5:1 pour le texte, 3:1 pour les grands titres
- **Focus ring** : 2px solid `--highlight`, offset 2px
- **Touch target** : Minimum 44×44px
- **Reduced motion** : Respecter `prefers-reduced-motion`
- **Labels** : Toutes les icônes isolées ont un `aria-label`

---

## 📱 Responsive

| Breakpoint | Comportement |
|------------|--------------|
| < 640px | Layout empilé, nav hamburger |
| 640-1024px | Grille 2 colonnes |
| > 1024px | Grille 3-4 colonnes, layout complet |
| Container max | 1400px centré |
