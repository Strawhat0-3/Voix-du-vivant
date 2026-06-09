import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import MagazineHero from "@/components/MagazineHero";
import EditorialGrid from "@/components/EditorialGrid";
import PodcastSection from "@/components/PodcastSection";
import AboutSection from "@/components/AboutSection";
import SupportSection from "@/components/SupportSection";
import PartnerBanner from "@/components/PartnerBanner";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
// NOTE: MagneticCanvasBackground, NoiseOverlay, CustomCursor
// sont maintenant montés dans App.tsx (global, jamais remontés au changement de route)

/* ─── Page entry animation ───────────────────────────────────────────── */
const pageVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Section reveal animation ───────────────────────────────────────── */
const sectionVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Index Page ─────────────────────────────────────────────────────── */
const Index = memo(() => {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["featured-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, excerpt, image_url, rubrique, content, created_at, slug")
        .eq("published", true)          // ✅ Contenu publié uniquement
        .order("created_at", { ascending: false }) // ✅ Plus récent en premier
        .limit(9); // [0] hero | [1-3] side | [4-8] editorial grid

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  /*
   * Séparation stricte des données :
   * [0]   → Article vedette (MagazineHero, colonne gauche)
   * [1-3] → 3 articles secondaires (MagazineHero, colonne droite)
   * [4-8] → 5 articles pour la grille éditoriale
   */
  const heroArticle = articles?.[0];
  const sideArticles = articles?.slice(1, 4) ?? [];
  const gridArticles = articles?.slice(4, 9) ?? [];

  return (
    <motion.div
      className="min-h-screen"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <SEO
        title="Accueil"
        description="Voix du Vivant Afrique – Média en ligne dédié à la biodiversité africaine. Découvrez nos articles, podcasts et ressources sur la faune, la flore et la conservation en Afrique."
      />

      <Header />

      <main id="main-content" role="main">
        {/* ── Hero Magazine 2/3 – 1/3 — Section très aérée ── */}
        <section
          className="py-20 md:py-32 bg-grain"
          aria-label="Article vedette"
          style={{ background: "transparent" }}
        >
          <div className="container px-4 md:px-8 lg:px-12">
            <MagazineHero
              heroArticle={heroArticle}
              sideArticles={sideArticles}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* ── Decorative divider ── */}
        <div className="container px-4 md:px-8" aria-hidden="true">
          <div className="flex items-center gap-6 py-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex gap-1.5">
              <div className="h-1 w-1 rounded-full bg-highlight/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-highlight" />
              <div className="h-1 w-1 rounded-full bg-highlight/60" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>

        {/* ── Grille Éditoriale Asymétrique ── */}
        <motion.section
          className="py-24 md:py-36"
          style={{ background: "transparent" }}
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="container px-4 md:px-8 lg:px-12">
            <EditorialGrid articles={gridArticles} isLoading={isLoading} />
          </div>
        </motion.section>

        {/* ── Podcast Section ── */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <PodcastSection />
        </motion.div>

        {/* ── About Section ── */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <AboutSection />
        </motion.div>

        {/* ── Support Section ── */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <SupportSection />
        </motion.div>

        {/* ── Partner Banner ── */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <PartnerBanner />
        </motion.div>
      </main>

      <Footer />
    </motion.div>
  );
});

Index.displayName = "Index";

export default Index;
