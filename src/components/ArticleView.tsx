import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "./Header";
import Footer from "./Footer";
import { CommentsSection } from "./CommentsSection";
import { useTrackView } from "@/hooks/useTrackView";
import { Calendar, User, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEO } from "./SEO";
import { SocialShare } from "./SocialShare";
import { BookmarkButton } from "./BookmarkButton";
import { sanitizeHtml } from "@/lib/sanitize";
import ClapButton from "./ClapButton";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  rubrique: string;
  image_url: string;
  created_at: string;
  author_id: string;
  meta_description?: string;
  profiles?: {
    full_name: string;
  };
}

export const ArticleView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useTrackView({
    contentId: article?.id || "",
    contentType: "article",
    enabled: !!article?.id,
  });

  useEffect(() => {
    if (slug) {
      fetchArticle();
      
    }
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (!error && data) {
      // Fetch author profile separately since there's no FK relationship
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", data.author_id)
        .maybeSingle();

      setArticle({
        ...data,
        profiles: profileData || undefined
      } as Article);
      fetchRating(data.id);
    }
    setLoading(false);
  };


  const fetchRating = async (articleId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const [ratingsRes, userRatingRes] = await Promise.all([
      supabase.from("article_ratings").select("rating").eq("article_id", articleId),
      user
        ? supabase
            .from("article_ratings")
            .select("rating")
            .eq("article_id", articleId)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (ratingsRes.data) {
      const ratings = ratingsRes.data.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      setRating({
        avgRating,
        totalRatings: ratings.length,
        userRating: userRatingRes.data?.rating || 0,
      });
    }
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, '');
    const words = textContent.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Article non trouvé</h1>
            <p className="text-muted-foreground mb-6">Cet article n'existe pas ou a été supprimé.</p>
            <Link to="/articles" className="text-primary hover:underline">
              Voir tous les articles
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={article.title}
        description={article.meta_description || article.excerpt}
        image={article.image_url}
        url={`/article/${slug}`}
        type="article"
        author={article.profiles?.full_name}
        publishedTime={article.created_at}
      />
      
      <Header />

      {/* Hero Section - Full Width with Background Image */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-hero" />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/articles" className="hover:text-white transition-colors">Articles</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white/90">{article.rubrique}</span>
          </nav>

          {/* Rubrique Badge */}
          <Badge 
            className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1.5 text-sm font-medium"
          >
            {article.rubrique}
          </Badge>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white max-w-4xl leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.profiles?.full_name || "Rédaction"}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(article.created_at).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {estimateReadTime(article.content)} min de lecture
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Article Content */}
            <article>
              {/* Excerpt/Lead */}
              <div className="border-l-4 border-primary pl-6 mb-10">
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed italic">
                  {article.excerpt}
                </p>
              </div>

              {/* Article Body */}
              <div 
                className="prose prose-lg max-w-none 
                  prose-headings:font-serif prose-headings:text-foreground
                  prose-p:text-foreground/90 prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-img:rounded-lg prose-img:shadow-natural
                  prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic
                  prose-li:text-foreground/90"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} 
              />

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 mt-10 pt-8 border-t border-border">
                <SocialShare 
                  url={`/article/${slug}`} 
                  title={article.title} 
                  description={article.excerpt}
                  variant="buttons"
                  size="default"
                />
                <div className="flex-1" />
                <BookmarkButton articleId={article.id} size="default" />
              </div>

              {/* Clap — Engagement éditorial */}
              <div className="mt-10 flex items-center justify-center">
                <ClapButton contentId={article.id} contentType="article" />
              </div>

              {/* Comments */}
              <div className="mt-12">
                <CommentsSection articleId={article.id} />
              </div>
            </article>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
