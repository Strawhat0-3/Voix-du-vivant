import { memo } from "react";
import type { ElementType } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Leaf, Waves, Mountain } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsletterForm } from "@/components/NewsletterForm";

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

interface EditorialGridProps {
  articles: ArticleItem[];
  isLoading: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
const estimateReadTime = (content: string): string => {
  const words = content.split(/\s+/).length;
  return `${Math.ceil(words / 200)} min`;
};

/* ─── Rubrique Icons ─────────────────────────────────────────────────── */
const RUBRIQUE_ICONS: Record<string, ElementType> = {
  "Faune": Leaf,
  "Flore": Leaf,
  "Océans": Waves,
  "Conservation": Mountain,
};

const RubriqueIcon = ({ rubrique }: { rubrique: string }) => {
  const Icon = RUBRIQUE_ICONS[rubrique] || Leaf;
  return <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />;
};

/* ─── Framer Motion Variants ─────────────────────────────────────────── */
const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Skeleton Grid ──────────────────────────────────────────────────── */
const GridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className={`space-y-3 ${i === 0 ? "md:col-span-2" : ""}`}
      >
        <Skeleton className="h-56 w-full rounded-leaf" />
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-6 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>
    ))}
  </div>
);

/* ─── Main Card (col-span-2, large format) ───────────────────────────── */
const MainCard = memo(({ article }: { article: ArticleItem }) => (
  <motion.article variants={cardVariant} className="md:col-span-2 group">
    <Link
      to={`/article/${article.slug}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-leaf"
      aria-label={`Lire : ${article.title}`}
    >
      {/* Image wrapper */}
      <div className="relative h-72 md:h-80 overflow-hidden rounded-leaf shadow-natural">
        <img
          src={article.image_url || "/placeholder.svg"}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {/* Gradient bottom */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          aria-hidden="true"
        />
        {/* Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-highlight text-highlight-foreground shadow-natural font-semibold text-overline px-3 py-1.5 rounded-full border-0 flex items-center gap-1.5">
            <RubriqueIcon rubrique={article.rubrique} />
            {article.rubrique}
          </Badge>
        </div>
      </div>

      {/* Text content */}
      <div className="pt-5 space-y-3">
        <h3 className="font-serif font-bold text-2xl leading-tight text-balance group-hover:text-primary transition-colors duration-300">
          {article.title}
        </h3>
        <p className="text-muted-foreground text-base leading-relaxed line-clamp-2">
          {article.excerpt || article.content.replace(/<[^>]+>/g, "").slice(0, 160) + "…"}
        </p>
        {/* Meta */}
        <div className="flex items-center gap-3 text-meta text-sm text-muted-foreground border-t border-border/50 pt-3">
          <time dateTime={article.created_at}>
            {format(new Date(article.created_at), "d MMMM yyyy", { locale: fr })}
          </time>
          <span aria-hidden="true" className="w-px h-3 bg-border" />
          <span className="flex items-center gap-1.5 text-primary">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            {estimateReadTime(article.content)}
          </span>
          <ArrowRight
            className="ml-auto h-4 w-4 text-highlight opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-300"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  </motion.article>
));
MainCard.displayName = "MainCard";

/* ─── Standard Card (col-span-1, rounded-leaf) ───────────────────────── */
const StandardCard = memo(({ article, roundingClass }: { article: ArticleItem; roundingClass: string }) => (
  <motion.article variants={cardVariant} className="group">
    <Link
      to={`/article/${article.slug}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-leaf"
      aria-label={`Lire : ${article.title}`}
    >
      {/* Image */}
      <div className={`relative h-56 overflow-hidden shadow-natural ${roundingClass}`}>
        <img
          src={article.image_url || "/placeholder.svg"}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          aria-hidden="true"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-secondary/90 text-secondary-foreground font-semibold text-overline px-2.5 py-1 rounded-full border-0 text-[10px] flex items-center gap-1">
            <RubriqueIcon rubrique={article.rubrique} />
            {article.rubrique}
          </Badge>
        </div>
        {/* Hover arrow */}
        <div
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-[opacity,transform] duration-300"
          aria-hidden="true"
        >
          <div className="bg-highlight text-highlight-foreground p-2 rounded-full shadow-glow">
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="pt-4 space-y-2.5">
        <h3 className="font-serif font-semibold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {article.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {article.excerpt || article.content.replace(/<[^>]+>/g, "").slice(0, 120) + "…"}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border/50 pt-2.5">
          <time dateTime={article.created_at}>
            {format(new Date(article.created_at), "d MMM yyyy", { locale: fr })}
          </time>
          <span className="flex items-center gap-1 text-primary">
            <Clock className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            {estimateReadTime(article.content)}
          </span>
        </div>
      </div>
    </Link>
  </motion.article>
));
StandardCard.displayName = "StandardCard";

/* ─── Newsletter Encart (rounded-pebble) ─────────────────────────────── */
const NewsletterEncart = memo(() => (
  <motion.div
    variants={cardVariant}
    className="rounded-pebble gradient-earth p-8 flex flex-col justify-center items-center text-center space-y-4 shadow-elevated"
  >
    <div className="text-overline text-primary-foreground/60 tracking-[0.2em]">
      Restez connecté
    </div>
    <h3 className="font-serif font-bold text-2xl text-primary-foreground leading-tight">
      La nature vous parle.<br />Écoutez-la chaque semaine.
    </h3>
    <p className="text-primary-foreground/75 text-sm leading-relaxed max-w-xs">
      Recevez nos meilleurs articles et podcasts sur la biodiversité africaine directement dans votre boîte mail.
    </p>
    <div className="w-full max-w-sm">
      <NewsletterForm
        variant="compact"
        className="[&_input]:bg-primary-foreground/10 [&_input]:border-primary-foreground/30 [&_input]:text-primary-foreground [&_input]:placeholder:text-primary-foreground/50"
      />
    </div>
  </motion.div>
));
NewsletterEncart.displayName = "NewsletterEncart";

/* ─── Section Header ─────────────────────────────────────────────────── */
const SectionHeader = ({ id, title, subtitle }: { id: string; title: string; subtitle: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
  >
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="h-0.5 w-10 bg-highlight rounded-full" aria-hidden="true" />
        <span className="text-overline text-xs text-muted-foreground tracking-widest">
          {subtitle}
        </span>
      </div>
      <h2 id={id} className="font-serif font-bold text-3xl md:text-4xl text-balance">
        {title}
      </h2>
    </div>
    <Link
      to="/articles"
      className="group flex items-center gap-2 text-sm font-medium text-primary hover:text-highlight transition-colors duration-300 shrink-0"
    >
      Voir tout
      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} aria-hidden="true" />
    </Link>
  </motion.div>
);

/* ─── Main Component ─────────────────────────────────────────────────── */
const EditorialGrid = memo(({ articles, isLoading }: EditorialGridProps) => {
  if (isLoading) return <GridSkeleton />;
  if (!articles || articles.length === 0) return null;

  // Rounding classes alternated per card position
  const ROUNDING_CLASSES = ["rounded-leaf", "rounded-leaf-reverse", "rounded-leaf", "rounded-pebble", "rounded-leaf-reverse"];

  // Layout: first article is a large (col-span-2) card, then 4 standard cards
  // After index 3, insert the newsletter encart
  const gridArticles = articles; // already sliced to the right count by parent

  return (
    <section aria-labelledby="exploration-heading" className="space-y-6">
      <SectionHeader
        id="exploration-heading"
        title="Exploration"
        subtitle="Nos dernières découvertes"
      />

      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10"
        role="list"
        aria-label="Grille éditoriale des articles"
      >
        {gridArticles.map((article, index) => {
          /* Render the large card at position 0 */
          if (index === 0) {
            return (
              <div key={article.id} role="listitem">
                <MainCard article={article} />
              </div>
            );
          }

          /* Inject newsletter encart after article 2 (i.e. in position 3 of the grid) */
          if (index === 3) {
            return [
              <div key="newsletter-encart" role="listitem">
                <NewsletterEncart />
              </div>,
              <div key={article.id} role="listitem">
                <StandardCard article={article} roundingClass={ROUNDING_CLASSES[index] || "rounded-leaf"} />
              </div>,
            ];
          }

          return (
            <div key={article.id} role="listitem">
              <StandardCard article={article} roundingClass={ROUNDING_CLASSES[index] || "rounded-leaf"} />
            </div>
          );
        })}
      </motion.div>
    </section>
  );
});

EditorialGrid.displayName = "EditorialGrid";

export default EditorialGrid;
