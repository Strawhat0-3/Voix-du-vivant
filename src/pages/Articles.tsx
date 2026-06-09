import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import ArticleSkeletonCard from "@/components/ArticleSkeletonCard";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { SEO } from "@/components/SEO";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  slug: string;
  rubrique: string;
  created_at: string;
  content: string;
}

const rubriques = [
  "Espèces à la loupe",
  "Comprendre l'environnement",
  "Acteurs du vivant",
  "Traditions & Nature",
  "Initiatives locales",
  "Jeunesse & Pédagogie",
  "Ressources",
] as const;

// Helper function to estimate read time
const estimateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, '');
  const words = textContent.split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / wordsPerMinute))} min`;
};

const Articles = memo(() => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRubrique, setSelectedRubrique] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, excerpt, image_url, slug, rubrique, created_at, content")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered articles for performance
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    if (selectedRubrique) {
      filtered = filtered.filter((article) => article.rubrique === selectedRubrique);
    }

    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [articles, selectedRubrique, debouncedSearchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleRubriqueChange = useCallback((value: string) => {
    setSelectedRubrique(value === "all" ? null : value);
  }, []);

  const clearRubrique = useCallback(() => {
    setSelectedRubrique(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Articles"
        description="Découvrez tous nos articles sur la biodiversité africaine. Espèces, environnement, traditions et initiatives locales."
        keywords={["articles", "biodiversité", "afrique", "nature", "environnement"]}
      />
      <Header />
      
      <main id="main-content" className="flex-1 container mx-auto px-4 py-8" role="main">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">
          Tous les articles
        </h1>

        {/* Search and filters */}
        <div className="mb-8 space-y-4" role="search" aria-label="Filtrer les articles">
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
              aria-label="Rechercher un article"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={selectedRubrique || "all"}
              onValueChange={handleRubriqueChange}
            >
              <SelectTrigger 
                className="w-full sm:w-[280px]"
                aria-label="Filtrer par rubrique"
              >
                <SelectValue placeholder="Filtrer par rubrique" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                <SelectItem value="all">Toutes les rubriques</SelectItem>
                {rubriques.map((rubrique) => (
                  <SelectItem key={rubrique} value={rubrique}>
                    {rubrique}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRubrique && (
              <button
                onClick={clearRubrique}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-1"
                aria-label="Effacer le filtre de rubrique"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div 
          className="mb-4 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {!loading && (
            <span>
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} trouvé{filteredArticles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Articles grid */}
        {loading ? (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-label="Chargement des articles"
            aria-busy="true"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} role="listitem">
                <ArticleSkeletonCard />
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div 
            className="text-center py-12"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground text-lg">
              Aucun article trouvé
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-label="Liste des articles"
          >
            {filteredArticles.map((article) => (
              <div key={article.id} role="listitem">
                <ArticleCard
                  title={article.title}
                  excerpt={article.excerpt || ""}
                  image={article.image_url || "/placeholder.svg"}
                  category={article.rubrique}
                  readTime={estimateReadTime(article.content)}
                  date={new Date(article.created_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                  slug={article.slug}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
});

Articles.displayName = "Articles";

export default Articles;
