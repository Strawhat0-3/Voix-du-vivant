import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, BookOpen, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import heroImage from "@/assets/hero-savanna.jpg";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface ArticleItem {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  rubrique: string;
  content: string;
  created_at: string;
  slug: string;
}

interface MagazineHeroProps {
  heroArticle: ArticleItem | undefined;
  sideArticles: ArticleItem[];
  isLoading: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
const estimateReadTime = (content: string): string => {
  const words = content.split(/\s+/).length;
  return `${Math.ceil(words / 200)} min`;
};

/* ─── Variants Framer Motion ─────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

/* ─── Hero Skeleton ──────────────────────────────────────────────────── */
const HeroSkeleton = () => (
  <div className="grid md:grid-cols-3 gap-6 lg:gap-8 animate-pulse">
    {/* Main hero skeleton */}
    <div className="md:col-span-2 relative h-[520px] rounded-leaf bg-muted overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent skeleton-shimmer" />
    </div>
    {/* Side skeletons */}
    <div className="flex flex-col gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="flex gap-3 p-4 bg-card rounded-leaf-reverse border border-border/40">
          <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Side Article Card ───────────────────────────────────────────────── */
const SideCard = memo(({ article, index }: { article: ArticleItem; index: number }) => (
  <motion.div variants={fadeUpVariant} custom={index}>
    <Link
      to={`/article/${article.slug}`}
      className="group flex gap-4 p-4 bg-card border border-border/40 hover:border-primary/30 rounded-leaf-reverse shadow-natural hover:shadow-float transition-[box-shadow,border-color] duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Lire : ${article.title}`}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-leaf">
        <img
          src={article.image_url || "/placeholder.svg"}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <span className="text-overline text-highlight text-[10px]">{article.rubrique}</span>
        <h3 className="font-serif font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-meta text-xs text-muted-foreground">
          <Clock className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
          <span>{estimateReadTime(article.content)}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.created_at}>
            {format(new Date(article.created_at), "d MMM", { locale: fr })}
          </time>
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight
        className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 self-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-[opacity,transform] duration-300"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </Link>
  </motion.div>
));
SideCard.displayName = "SideCard";

/* ─── Main Component ─────────────────────────────────────────────────── */
const MagazineHero = memo(({ heroArticle, sideArticles, isLoading }: MagazineHeroProps) => {
  if (isLoading) return <HeroSkeleton />;

  /* Fallback: no articles in DB yet — show the static brand hero */
  if (!heroArticle) {
    return (
      <section
        className="relative h-[70vh] min-h-[500px] w-full overflow-hidden rounded-leaf shadow-elevated"
        aria-label="Bannière d'accueil Voix du Vivant Afrique"
      >
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
        />
        <div className="absolute inset-0 gradient-hero" aria-hidden="true" />
        <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl space-y-4"
          >
            <span className="text-overline text-primary-foreground/60 tracking-[0.2em]">
              Biodiversité Africaine
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-primary-foreground leading-tight">
              Voix du Vivant{" "}
              <span className="text-gradient-sunset">Afrique</span>
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Découvrir, Comprendre et Protéger la richesse naturelle du continent africain.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/articles">
                <Button size="lg" variant="highlight">
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  Explorer les articles
                </Button>
              </Link>
              <Link to="/podcasts">
                <Button size="lg" variant="outline" className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/15 backdrop-blur-sm">
                  <Headphones className="w-4 h-4" aria-hidden="true" />
                  Écouter les podcasts
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const heroDate = format(new Date(heroArticle.created_at), "d MMMM yyyy", { locale: fr });
  const heroReadTime = estimateReadTime(heroArticle.content);
  // Prepare dropcap: first sentence of excerpt or content
  const leadText = heroArticle.excerpt || heroArticle.content.slice(0, 180).replace(/<[^>]+>/g, "");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid md:grid-cols-3 gap-8 lg:gap-14"
      role="region"
      aria-labelledby="hero-article-title"
    >
      {/* ── Colonne Gauche : Article Vedette (2/3) ── */}
      <motion.div variants={fadeUpVariant} className="md:col-span-2">
        <Link
          to={`/article/${heroArticle.slug}`}
          className="group relative block h-[480px] md:h-[560px] overflow-hidden rounded-leaf shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Article vedette : ${heroArticle.title}`}
        >
          {/* Background image */}
          <img
            src={heroArticle.image_url || heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover scale-105 will-change-transform group-hover:scale-100"
            style={{ transition: 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 gradient-hero" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 space-y-4">
            {/* Category badge */}
            <Badge className="self-start bg-highlight text-highlight-foreground shadow-glow font-semibold text-overline px-3 py-1.5 rounded-full border-0">
              {heroArticle.rubrique}
            </Badge>

            {/* Title */}
            <h2
              id="hero-article-title"
              className="font-serif font-bold text-primary-foreground tracking-tighter leading-none text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-balance group-hover:text-highlight transition-colors duration-300"
            >
              {heroArticle.title}
            </h2>

            {/* Lead text with dropcap */}
            <p className="dropcap text-primary-foreground/80 text-base leading-relaxed line-clamp-3 max-w-prose">
              {leadText}
            </p>

            {/* Meta bar */}
            <div className="flex items-center gap-4 text-primary-foreground/60 text-sm pt-1">
              <time dateTime={heroArticle.created_at}>{heroDate}</time>
              <span aria-hidden="true" className="w-px h-4 bg-primary-foreground/30" />
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                {heroReadTime} de lecture
              </span>
              <span aria-hidden="true" className="ml-auto">
                <ArrowRight
                  className="h-5 w-5 text-highlight opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  strokeWidth={2}
                />
              </span>
            </div>
          </div>

          {/* Grain texture overlay */}
          <div className="absolute inset-0 bg-grain pointer-events-none" aria-hidden="true" />
        </Link>
      </motion.div>

      {/* ── Colonne Droite : Articles Secondaires (1/3) ── */}
      <motion.div variants={fadeInVariant} className="flex flex-col gap-4 justify-between">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-1">
          <div className="h-0.5 w-8 bg-highlight rounded-full" aria-hidden="true" />
          <span className="text-overline text-xs text-muted-foreground tracking-widest">À lire aussi</span>
        </div>

        {/* Side article cards */}
        {sideArticles.slice(0, 3).map((article, i) => (
          <SideCard key={article.id} article={article} index={i} />
        ))}

        {/* CTA lien vers tous les articles */}
        <motion.div variants={fadeUpVariant} className="mt-2">
          <Link
            to="/articles"
            className="group flex items-center gap-2 text-sm font-medium text-primary hover:text-highlight transition-colors duration-300 link-underline"
          >
            Tous les articles
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

MagazineHero.displayName = "MagazineHero";

export default MagazineHero;
